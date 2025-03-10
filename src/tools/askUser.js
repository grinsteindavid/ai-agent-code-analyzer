/**
 * Ask user for information like API keys, credentials, or other required information
 * Uses inquirer for interactive prompts
 */

const inquirer = require('inquirer');
const logger = require('../utils/logger');

// Define JSON schema for the tool
const askUserSchema = {
  type: 'object',
  required: ['question', 'inputType', 'defaultValue', 'choices', 'validateRegex'],
  additionalProperties: false,
  properties: {
    question: {
      type: 'string',
      description: 'The question or prompt to display to the user'
    },
    inputType: {
      type: 'string',
      enum: ['input', 'password', 'confirm', 'list', 'checkbox'],
      description: 'Type of input to collect from user (input=text, password=masked input, confirm=yes/no, list=select one from options, checkbox=select multiple)'
    },
    defaultValue: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'value'],
      properties: {
        type: {
          type: 'string',
          enum: ['string', 'boolean', 'number', 'array', 'null'],
          description: 'Type of the default value'
        },
        value: {
          type: 'string',
          description: 'The actual default value'
        }
      },
      description: 'Optional default value to change inquirer prompt'
    },
    choices: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'Optional array of choices for list or checkbox input types'
    },
    validateRegex: {
      type: 'string',
      description: 'Optional regex pattern to validate user input'
    }
  },
  description: 'Used to ask the user for information such as API keys, credentials, or other inputs needed to proceed with tasks.'
};

/**
 * Prompt the user for information
 * @param {string} question - The question or prompt to display
 * @param {string} inputType - Type of input (input, password, confirm, list, checkbox)
 * @param {Object|null} defaultValue - Optional default value object with type and value properties
 * @param {Array<string>} choices - Optional array of choices for list/checkbox types
 * @param {string} validateRegex - Optional regex pattern to validate user input
 * @returns {Object} Result object containing the user's response with status and input properties
 */
async function askUser(question, inputType, defaultValue = null, choices = [], validateRegex = null) {
  try {
    // Configure the question based on input type
    const promptConfig = {
      type: inputType,
      name: 'answer',
      message: question,
    };
    
    // Add appropriate options based on input type
    if (defaultValue !== null && typeof defaultValue === 'object') {
      const { type, value } = defaultValue;
      
      // Cast the value based on the specified type
      if (value !== null) {
        if (type === 'string') {
          promptConfig.default = String(value);
        } else if (type === 'number') {
          promptConfig.default = Number(value);
        } else if (type === 'boolean') {
          promptConfig.default = Boolean(value === 'true' || value === true);
        } else if (type === 'array') {
          if (Array.isArray(value)) {
            promptConfig.default = value;
          } else if (typeof value === 'string') {
            promptConfig.default = value.split(',').map(item => item.trim());
          } else {
            promptConfig.default = [value];
          }
        } else {
          promptConfig.default = value;
        }
      }
    }
    
    if (['list', 'checkbox'].includes(inputType) && choices.length > 0) {
      promptConfig.choices = choices;
    }
    
    // Add validation if provided
    if (validateRegex) {
      const regex = new RegExp(validateRegex);
      promptConfig.validate = (input) => {
        return regex.test(input) || `Input must match pattern: ${validateRegex}`;
      };
    }
    
    // Log the prompt action
    logger.debug(` 💬 Asking user: ${question}`);
    
    // Present the prompt to the user
    const response = await inquirer.prompt([promptConfig]);
    
    // Send user input back to the AI agent
    return {
      status: 'success',
      input: response.answer
    };
  } catch (error) {
    logger.error(`Error getting user input: ${error.message}`);
    return {
      status: 'error',
      error: error.message
    };
  }
}

module.exports = {
  askUser,
  askUserSchema
};
