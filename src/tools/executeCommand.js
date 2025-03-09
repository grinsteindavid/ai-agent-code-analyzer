const os = require('os');
const { exec } = require('child_process');
const logger = require('../utils/logger');

/**
 * JSON Schema for execute_command function parameters.
 */
const executeCommandSchema = {
  type: "object",
  required: ["command", "args", "timeout"],
  additionalProperties: false,
  properties: {
    command: {
      type: "string",
      description: "The command to execute on the system."
    },
    args: {
      type: "array",
      description: "Arguments to pass to the command.",
      items: {
        type: "string"
      },
    },
    timeout: {
      type: "number",
      description: "Timeout in milliseconds for the command execution. default 900000ms (15 minutes)"
    }
  },
  description: "Executes a system command based on the user's operating system and returns the result."
};

/**
 * Get system information to provide context for command execution
 * @returns {Object} System metadata
 */
function getSystemMetadata() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    userInfo: os.userInfo(),
    cpus: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
    freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)) + ' GB'
  };
}

/**
 * Executes a system command based on the user's operating system.
 *
 * @param {string} command - The command to execute.
 * @param {Array<string>} [args=[]] - Arguments to pass to the command.
 * @param {number} [timeout=30000] - Timeout in milliseconds.
 * @returns {Promise<Object>} A promise that resolves to the result of the command execution.
 */
async function executeCommand(command, args = [], timeout = 30000) {
  return new Promise((resolve, reject) => {
    const systemInfo = getSystemMetadata();
    logger.debug(`Executing command on ${systemInfo.platform}: ${command} ${args.join(' ')}`);
    
    // Prepare the full command
    const fullCommand = [command, ...args].join(' ');
    
    // Set timeout for the command execution
    const timer = setTimeout(() => {
      reject({
        status: 'error',
        error: `Command execution timed out after ${timeout}ms`,
        command: fullCommand,
        systemInfo
      });
    }, timeout);
    
    // Execute the command
    exec(fullCommand, { timeout }, (error, stdout, stderr) => {
      clearTimeout(timer);
      
      if (error) {
        return reject({
          status: 'error',
          error: error.message,
          command: fullCommand,
          stderr,
          systemInfo
        });
      }
      
      resolve({
        status: 'success',
        command: fullCommand,
        stdout,
        stderr,
        systemInfo
      });
    });
  });
}

module.exports = {
  executeCommand,
  executeCommandSchema
};
