/**
 * Application context - stores global variables
 */
const context = {
  currentDirectory: process.cwd(),
  plan: null,
  debug: false, // Debug flag
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
 * Get the debug status
 * @returns {boolean} The current debug status
 */
function getDebug() {
  return context.debug;
}

/**
 * Set the debug status
 * @param {boolean} debugStatus - The debug status to set
 */
function setDebug(debugStatus) {
  context.debug = !!debugStatus; // Convert to boolean
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
  getDebug,
  setDebug,
};
