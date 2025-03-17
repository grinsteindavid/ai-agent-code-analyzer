/**
 * Print information to the console with color formatting
 * Uses logger utility for colored output
 * Intended for showing a portion or summary of content to avoid displaying large messages
 */

const logger = require('../utils/logger');

// Define JSON schema for the tool
const showInfoSchema = {
  type: 'object',
  required: ['message', 'type'],
  additionalProperties: false,
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
  description: 'It displays information to the user by the AI agent.'
};

/**
 * Show information with colored output in the console
 * @param {Object} params - The parameters for the function
 * @param {string} params.message - The message to display (should be a summary or portion of content for large data)
 * @param {string} [params.type='info'] - The type of message (info, success, warning, error, debug)
 * @returns {Object} Result object containing the message and type
 */
async function showInfo({ message, type = 'info' }) {
  // Use the logger to display the message and get the result
  const result = logger.log(message, type);
  
  return result;
}

module.exports = {
  showInfo,
  showInfoSchema
};
