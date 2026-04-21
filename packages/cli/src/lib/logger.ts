import chalk from 'chalk';

let quietMode = false;

export const logger = {
  setQuiet(q: boolean) { quietMode = q; },
  info(msg: string)    { if (!quietMode) console.log(msg); },
  success(msg: string) { if (!quietMode) console.log(chalk.green('✓') + ' ' + msg); },
  warn(msg: string)    { if (!quietMode) console.warn(chalk.yellow('⚠') + ' ' + msg); },
  error(msg: string)   { console.error(chalk.red('✗') + ' ' + msg); },
  dry(msg: string)     { if (!quietMode) console.log(chalk.cyan('~') + ' ' + chalk.dim('[dry-run] ') + msg); },
  json(data: unknown)  { console.log(JSON.stringify(data, null, 2)); },
};
