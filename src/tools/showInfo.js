/**
 * Print information to the console with color formatting
 * Uses chalk for colored output: https://github.com/chalk/chalk
 * Intended for showing a portion or summary of content to avoid displaying large messages
 */

const chalk = require('chalk');

// Define JSON schema for the tool
const showInfoSchema = {
  type: 'object',
  required: ['message', 'type'],
  properties: {
    message: {
      type: 'string',
      description: 'The message to display'
    },
    type: {
      type: 'string',
      enum: ['info', 'success', 'warning', 'error', 'debug'],
      description: 'The type of message affecting its color (info=blue, success=green, warning=yellow, error=red, debug=cyan)'
    }
  },
  description: 'Print a summary or portion of content to the console with color formatting to avoid displaying large messages'
};

/**
 * Show information with colored output in the console
 * @param {string} message - The message to display (should be a summary or portion of content for large data)
 * @param {string} type - The type of message (info, success, warning, error, debug)
 * @returns {Object} Result object containing the message and type
 */
async function showInfo(message, type = 'info') {
  // Define color schemes for different message types
  const colorSchemes = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    debug: chalk.cyan,
  };

  // Get the appropriate color function or default to white
  const colorFn = colorSchemes[type.toLowerCase()] || chalk.white;

  // Format prefix based on message type
  let prefix = '';
  switch (type.toLowerCase()) {
    case 'success':
      prefix = '✅ ';
      break;
    case 'warning':
      prefix = '⚠️ ';
      break;
    case 'error':
      prefix = '❌ ';
      break;
    case 'debug':
      prefix = '🔍 ';
      break;
    case 'info':
    default:
      prefix = 'ℹ️ ';
      break;
  }

  // Print the colored message
  console.log(colorFn(`${prefix}${message}`));

  // Return result object
  return {
    message,
    type,
    timestamp: new Date().toISOString()
  };
}



module.exports = {
  showInfo,
  showInfoSchema
};
