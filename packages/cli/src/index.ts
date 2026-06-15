#!/usr/bin/env node
import { program } from 'commander'
import { redactCommand } from './commands/redact.js'
import { configCommand } from './commands/config.js'
import { reviewCommand } from './commands/review.js'
import { installHookCommand } from './commands/install-hook.js'

program
  .name('masqo')
  .description('Local redaction engine - detect and mask secrets before they leak')
  .version('0.0.0')

program.addCommand(redactCommand)
program.addCommand(configCommand)
program.addCommand(reviewCommand)
program.addCommand(installHookCommand)

program.parse()
