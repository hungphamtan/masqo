import { Command } from 'commander'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'

const SUPPORTED_TARGETS = ['claude-code']
const HOOK_COMMAND = 'masqo redact --claude-hook'

function claudeDir(): string {
  return process.env['MASQO_CLAUDE_DIR'] ?? resolve(homedir(), '.claude')
}

interface ClaudeSettings {
  hooks?: {
    PreToolUse?: Array<{ matcher: string; hooks: Array<{ type: string; command: string }> }>
    PostToolUse?: Array<{ matcher: string; hooks: Array<{ type: string; command: string }> }>
  }
  permissions?: Record<string, unknown>
  [key: string]: unknown
}

export const installHookCommand = new Command('install-hook')
  .description('Install masqo as a hook in an AI tool')
  .argument('<target>', 'Target to install hook in (claude-code)')
  .action((target: string) => {
    if (!SUPPORTED_TARGETS.includes(target)) {
      process.stderr.write(
        `error: unknown hook target "${target}". Supported: ${SUPPORTED_TARGETS.join(', ')}\n`
      )
      process.exit(1)
    }

    const dir = claudeDir()
    const settingsPath = resolve(dir, 'settings.json')

    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    let settings: ClaudeSettings = {}
    if (existsSync(settingsPath)) {
      try {
        settings = JSON.parse(readFileSync(settingsPath, 'utf8')) as ClaudeSettings
      } catch {
        settings = {}
      }
    }

    if (!settings.hooks) settings.hooks = {}
    if (!settings.hooks.PreToolUse) settings.hooks.PreToolUse = []

    // Check if already installed
    const alreadyInstalled = settings.hooks.PreToolUse.some((entry) =>
      entry.hooks.some((h) => h.command.includes(HOOK_COMMAND))
    )

    if (alreadyInstalled) {
      process.stdout.write('masqo hook already installed - no changes made\n')
      return
    }

    settings.hooks.PreToolUse.push({
      matcher: 'Write|Edit|MultiEdit',
      hooks: [
        {
          type: 'command',
          command: HOOK_COMMAND,
        },
      ],
    })

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
    process.stdout.write(`✓ masqo hook installed in ${settingsPath}\n`)
    process.stdout.write('  Hook triggers on Write/Edit/MultiEdit tool calls\n')
    process.stdout.write(`  Command: ${HOOK_COMMAND}\n`)
  })
