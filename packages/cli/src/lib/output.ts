import chalk from 'chalk'
import type { Detection } from '@masqo/shared'

export function printSummary(detections: Detection[], noColor = false): void {
  if (detections.length === 0) {
    const msg = noColor ? '✓ No secrets detected\n' : chalk.green('✓ No secrets detected\n')
    process.stderr.write(msg)
    return
  }
  const header = noColor
    ? `⚠ ${detections.length} secret(s) detected:\n`
    : chalk.yellow(`⚠ ${detections.length} secret(s) detected:\n`)
  process.stderr.write(header)

  for (const d of detections) {
    const line = noColor
      ? `  - ${d.type} (confidence: ${Math.round(d.confidence * 100)}%)\n`
      : `  - ${chalk.red(d.type)} ${chalk.dim(`(confidence: ${Math.round(d.confidence * 100)}%)`)}\n`
    process.stderr.write(line)
  }
}
