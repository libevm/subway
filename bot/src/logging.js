// Helpers for logging

import chalk from 'chalk'

export const logWarn = (...args) => {
  console.log(chalk.hex("#FFA500")(...args));
};

export const logSuccess = (...args) => {
  console.log(chalk.green(...args));
};

export const logInfo = (...args) => {
  console.log(chalk.yellow(...args));
};

export const logError = (...args) => {
  console.log(chalk.red(...args));
};

export const logTrace = (...args) => {
  console.log(chalk.grey(...args));
};

export const logDebug = (...args) => {
  console.log(chalk.magenta(...args));
};

export const logFatal = (...args) => {
  console.log(chalk.redBright(...args));
};