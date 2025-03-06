/**
 * Logger utility with color formatting
 * Uses chalk for colored output: https://github.com/chalk/chalk
 */

const chalk = require('chalk');
const { CHAT_DEBUG } = process.env;

/**
 * Logger class for consistent logging with color formatting
 */
class Logger {
  constructor() {
    // Define color schemes for different message types
    this.colorSchemes = {
      info: chalk.blueBright,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      debug: chalk.cyan,
    };

    // Define prefixes for different message types
    this.prefixes = {
      success: '✅ ',
      warning: '⚠️ ',
      error: '❌ ',
      debug: '🔍 ',
      info: 'ℹ️ ',
    };
  }

  /**
   * Log a message with the specified type
   * @param {string} message - The message to display
   * @param {string} type - The type of message (info, success, warning, error, debug)
   * @returns {Object} Result object containing the message and type
   */
  log(message, type = 'info') {
    // Get the appropriate color function or default to white
    const colorFn = this.colorSchemes[type.toLowerCase()] || chalk.white;
    
    // Get the appropriate prefix
    const prefix = this.prefixes[type.toLowerCase()] || '';
    
    // Print the colored message
    console.log(colorFn(`${prefix}${message}`));
    
    // Return result object
    return {
      message,
      type,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log info message (blue)
   * @param {string} message - The message to display
   */
  info(message) {
    return this.log(message, 'info');
  }

  /**
   * Log success message (green)
   * @param {string} message - The message to display
   */
  success(message) {
    return this.log(message, 'success');
  }

  /**
   * Log warning message (yellow)
   * @param {string} message - The message to display
   */
  warning(message) {
    return this.log(message, 'warning');
  }

  /**
   * Log error message (red)
   * @param {string} message - The message to display
   */
  error(message) {
    return this.log(message, 'error');
  }

  /**
   * Log debug message (cyan) if DEBUG is enabled
   * @param {string} message - The message to display
   */
  debug(message) {
    if (CHAT_DEBUG === 'true') {
      return this.log(message, 'debug');
    }
    return null;
  }
}

// Create and export a singleton instance
const logger = new Logger();

module.exports = logger;
