import { Command } from 'commander'
import { loadConfig, saveConfig } from '../lib/config-store.js'

const VALID_PRESETS = ['developer', 'general']

export const configCommand = new Command('config')
  .description('Manage masqo configuration')

configCommand
  .command('get')
  .description('Show current configuration')
  .action(() => {
    const config = loadConfig()
    process.stdout.write(JSON.stringify(config, null, 2) + '\n')
  })

configCommand
  .command('set-policy <name>')
  .description('Set default policy preset (developer|general)')
  .action((name: string) => {
    if (!VALID_PRESETS.includes(name)) {
      process.stderr.write(`error: unknown policy "${name}". Valid: ${VALID_PRESETS.join(', ')}\n`)
      process.exit(1)
    }
    const config = loadConfig()
    config.policy = name
    saveConfig(config)
    process.stdout.write(`policy set to "${name}"\n`)
  })

configCommand
  .command('add-rule')
  .description('Add a custom detection rule')
  .requiredOption('--pattern <regex>', 'Regex pattern to match')
  .requiredOption('--type <type>', 'Detection type identifier')
  .requiredOption('--name <name>', 'Human-readable rule name')
  .action((opts: { pattern: string; type: string; name: string }) => {
    try {
      new RegExp(opts.pattern)
    } catch {
      process.stderr.write(`error: invalid regex pattern "${opts.pattern}"\n`)
      process.exit(1)
    }
    const config = loadConfig()
    config.customRules.push({ pattern: opts.pattern, type: opts.type, name: opts.name })
    saveConfig(config)
    process.stdout.write(`rule added: ${opts.name} (${opts.pattern})\n`)
  })
