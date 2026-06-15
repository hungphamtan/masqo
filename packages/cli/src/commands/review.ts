import { Command } from 'commander'
import { createEngine } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'
import type { Detection } from '@masqo/shared'
import { readStdin } from '../lib/stdin.js'
import { readFile, writeFile } from 'fs/promises'
import { redact } from '@masqo/engine'

interface ReviewOptions {
  acceptAll: boolean
  rejectAll: boolean
  output?: string
  format: string
  policy?: string
}

export const reviewCommand = new Command('review')
  .description('Interactively review and approve/reject detected secrets')
  .argument('[file]', 'Input file (omit to read from stdin)')
  .option('--accept-all', 'Accept all detections (non-interactive)')
  .option('--reject-all', 'Reject all detections - output original unchanged')
  .option('-o, --output <file>', 'Write output to file instead of stdout')
  .option('-f, --format <format>', 'Output format: text|json', 'text')
  .option('-p, --policy <name>', 'Policy preset name: developer|general')
  .action(async (file: string | undefined, opts: ReviewOptions) => {
    const input = await (async () => {
      try {
        return file ? await readFile(file, 'utf8') : await readStdin()
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        process.stderr.write(`error: ${msg}\n`)
        process.exit(1)
      }
    })()

    const engine = createEngine()
    const result = engine.scan(input, {
      mode: ReplacementMode.Redact,
      ...(opts.policy ? { presetName: opts.policy } : {}),
    })

    const { detections } = result

    if (detections.length === 0) {
      await emit(input, [], [], input, opts)
      return
    }

    const isCI = process.env['CI'] === '1'
    const isTTY = process.stdout.isTTY && !isCI

    let accepted: Set<number>

    if (opts.rejectAll) {
      accepted = new Set()
    } else if (opts.acceptAll || !isTTY) {
      accepted = new Set(detections.map((_, i) => i))
    } else {
      accepted = await runInteractive(input, detections)
    }

    const acceptedDetections = detections.filter((_, i) => accepted.has(i))
    const rejectedDetections = detections.filter((_, i) => !accepted.has(i))
    const output = redact(input, acceptedDetections)

    await emit(output, acceptedDetections, rejectedDetections, input, opts)
  })

async function runInteractive(original: string, detections: Detection[]): Promise<Set<number>> {
  const { render } = await import('ink')
  const React = (await import('react')).default
  const { ReviewApp } = await import('../ui/ReviewApp.js')

  return new Promise((resolve) => {
    const { unmount } = render(
      React.createElement(ReviewApp, {
        original,
        detections,
        onDone: (accepted) => {
          unmount()
          resolve(accepted)
        },
      })
    )
    // Safety: if render exits without calling onDone, accept all
    process.on('exit', () => resolve(new Set(detections.map((_, i) => i))))
  })
}

async function emit(
  output: string,
  accepted: Detection[],
  rejected: Detection[],
  _original: string,
  opts: ReviewOptions
): Promise<void> {
  const isJson = opts.format === 'json'

  let content: string
  if (isJson) {
    content = JSON.stringify({
      output,
      accepted: accepted.length,
      rejected: rejected.length,
      acceptedDetections: accepted.map((d) => ({ type: d.type, source: d.source })),
      rejectedDetections: rejected.map((d) => ({ type: d.type, source: d.source })),
    }, null, 2) + '\n'
  } else {
    content = output.endsWith('\n') ? output : output + '\n'
    if (!opts.output) {
      process.stderr.write(
        `Summary: ${accepted.length} redacted, ${rejected.length} skipped\n`
      )
    }
  }

  if (opts.output) {
    await writeFile(opts.output, content, 'utf8')
  } else {
    process.stdout.write(content)
  }
}
