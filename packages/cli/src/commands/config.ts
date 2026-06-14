import { Command } from 'commander'

export const configCommand = new Command('config')
  .description('Manage masqo configuration')
  .action(() => {
    // Implemented in Task 4.4
    process.stderr.write('config command not yet implemented\n')
    process.exit(1)
  })
