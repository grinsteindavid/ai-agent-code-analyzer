/**
 * Application context - stores global variables
 */
const context = {
  currentDirectory: process.cwd(),
  messages: [
    
  ], // Store conversation history
};

/**
 * Get the current working directory
 * @returns {string} The current working directory
 */
function getCurrentDirectory() {
  return context.currentDirectory;
}

/**
 * Set the current working directory
 * @param {string} dir - The directory to set as current
 */
function setCurrentDirectory(dir) {
  context.currentDirectory = dir;
}

/**
 * Get all conversation messages
 * @returns {Array} The conversation messages
 */
function getMessages() {
  return context.messages;
}

/**
 * Add a message to the conversation history
 * @param {string} role - The role of the message sender (user or assistant)
 * @param {string} content - The content of the message
 */
function addMessage(role, content) {
  context.messages.push({ role, content, timestamp: new Date().toISOString() });
}

/**
 * Clear all conversation messages
 */
function clearMessages() {
  context.messages = [];
}

module.exports = {
  context,
  getCurrentDirectory,
  setCurrentDirectory,
  getMessages,
  addMessage,
  clearMessages,
};
