/**
 * Application context - stores global variables
 */
const context = {
  currentDirectory: process.cwd(),
  plan: null,
  messages: [
    
  ], // Store conversation history
};

/**
 * Get the current plan
 * @returns {Object|null} The current plan
 */
function getPlan() {
  return context.plan;
}

/**
 * Set the current plan
 * @param {Object} newPlan - The new plan to set
 */
function setPlan(newPlan) {
  context.plan = newPlan;
}


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

/**
 * Get the appropriate role for the next message based on the previous message
 * @returns {string} The role for the next message ('user' or 'assistant')
 */
function getNextMessageRole() {
  if (context.messages.length === 0) {
    return 'user'; // Default to user if no previous messages
  }
  
  const lastMessage = context.messages[context.messages.length - 1];
  return lastMessage.role === 'user' ? 'assistant' : 'user';
}

module.exports = {
  context,
  getPlan,
  setPlan,
  getCurrentDirectory,
  setCurrentDirectory,
  getMessages,
  addMessage,
  clearMessages,
  getNextMessageRole,
};
