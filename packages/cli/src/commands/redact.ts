import { Command } from 'commander'
import { createEngine } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'
import { readStdin } from '../lib/stdin.js'
import { printSummary } from '../lib/output.js'
import { readFile, writeFile, stat } from 'fs/promises'
import ora from 'ora'

const MODES: Record<string, ReplacementMode> = {
  redact: ReplacementMode.Redact,
  tokenize: ReplacementMode.Tokenize,
  partial: ReplacementMode.Partial,
  warn: ReplacementMode.Warn,
}

const LARGE_FILE_BYTES = 1024 * 1024 // 1MB

interface RedactOptions {
  mode: string
  policy?: string
  format: string
  output?: string
  hook: boolean
  claudeHook: boolean
  noColor: boolean
}

interface ClaudeHookInput {
  tool_name?: string
  tool_input?: {
    content?: string
    file_path?: string
    new_string?: string
    edits?: Array<{ old_string?: string; new_string?: string }>
  }
}

export const redactCommand = new Command('redact')
  .description('Scan and redact secrets from stdin or a file')
  .argument('[file]', 'Input file (omit to read from stdin)')
  .option('-m, --mode <mode>', 'Replacement mode: redact|tokenize|partial|warn', 'redact')
  .option('-p, --policy <name>', 'Policy preset name: developer|general')
  .option('-f, --format <format>', 'Output format: text|json', 'text')
  .option('-o, --output <file>', 'Write output to file instead of stdout')
  .option('--hook', 'Hook mode: non-interactive, JSON output, exit code signals detections')
  .option('--claude-hook', 'Claude Code hook mode: reads JSON from stdin, scans tool_input.content')
  .option('--no-color', 'Disable colored output')
  .action(async (file: string | undefined, opts: RedactOptions) => {
    const isHook = opts.hook
    const isClaudeHook = opts.claudeHook
    const noColor = opts.noColor || isHook || isClaudeHook || !process.stderr.isTTY

    // Claude Code hook: stdin is JSON with tool_input.content/new_string/edits
    if (isClaudeHook) {
      const raw = await readStdin()

      // Guard against enormous payloads before parsing
      if (raw.length > 10 * 1024 * 1024) {
        process.stdout.write(JSON.stringify({ continue: true }) + '\n')
        process.exit(0)
      }

      let hookInput: ClaudeHookInput = {}
      try { hookInput = JSON.parse(raw) as ClaudeHookInput } catch { /* not JSON, ignore */ }

      // Write → content, Edit → new_string, MultiEdit → edits[].new_string
      const content =
        hookInput.tool_input?.content ??
        hookInput.tool_input?.new_string ??
        hookInput.tool_input?.edits?.map((e) => e.new_string ?? '').join('\n') ??
        ''

      if (!content.trim()) {
        // Nothing to scan — let Claude proceed
        process.stdout.write(JSON.stringify({ continue: true }) + '\n')
        process.exit(0)
      }

      const mode = MODES[opts.mode] ?? ReplacementMode.Redact
      const engine = createEngine()
      const result = engine.scan(content, {
        mode,
        ...(opts.policy ? { presetName: opts.policy } : {}),
      })

      if (result.detections.length === 0) {
        process.stdout.write(JSON.stringify({ continue: true }) + '\n')
        process.exit(0)
      }

      const summary = result.detections
        .map((d) => `${d.type} (${Math.round(d.confidence * 100)}%)`)
        .join(', ')

      process.stdout.write(JSON.stringify({
        continue: false,
        stopReason: `Masqo detected secrets in file content: ${summary}. Review and redact before proceeding.`,
      }) + '\n')
      process.exit(0)
    }

    const input = await (async () => {
      try {
        return file ? await readFile(file, 'utf8') : await readStdin()
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        process.stderr.write(`error: ${msg}\n`)
        process.exit(1)
      }
    })()

    // Show spinner for large files
    let spinner: ReturnType<typeof ora> | null = null
    if (file && !isHook && process.stderr.isTTY) {
      const fileSize = await stat(file).then((s) => s.size).catch(() => 0)
      if (fileSize >= LARGE_FILE_BYTES) {
        spinner = ora({ text: `Scanning ${file}...`, stream: process.stderr }).start()
      }
    }

    const mode = MODES[opts.mode] ?? ReplacementMode.Redact
    const engine = createEngine()

    const result = engine.scan(input, {
      mode,
      ...(opts.policy ? { presetName: opts.policy } : {}),
    })

    spinner?.succeed(`Scanned — ${result.detections.length} detection(s)`)

    const isJson = isHook || opts.format === 'json'

    if (isJson) {
      const json = JSON.stringify({
        output: result.output,
        detections: result.detections.map((d) => ({
          type: d.type,
          position: d.position,
          confidence: d.confidence,
          explanation: d.explanation,
          source: d.source,
        })),
        mode: result.mode,
      }, null, isHook ? 0 : 2)

      if (opts.output) {
        await writeFile(opts.output, json, 'utf8')
      } else {
        process.stdout.write(json + '\n')
      }
      process.exit(isHook && result.detections.length > 0 ? 1 : 0)
    }

    // text mode
    if (result.mode === ReplacementMode.Warn) {
      process.stderr.write(
        `warning: ${result.detections.length} secret(s) detected but not redacted (warn mode)\n`
      )
    } else if (!isHook) {
      printSummary(result.detections, noColor)
    }

    const out = result.output.endsWith('\n') ? result.output : result.output + '\n'

    if (opts.output) {
      await writeFile(opts.output, out, 'utf8')
    } else {
      process.stdout.write(out)
    }
  })
