/**
 * Application context - stores global variables
 */
const context = {
  currentDirectory: process.cwd(),
  plan: null,
  debug: false, // Debug flag
  messages: [
    
  ], // Store conversation history
  websiteContent: {}, // Store website content chunks by URL
  /* Example structure:
  websiteContent: {
    'https://example.com': {
      url: 'https://example.com',
      title: 'Example Website',
      totalChunks: 3,
      chunks: [
        'Chunk 1 content here...',
        'Chunk 2 content here...',
        'Chunk 3 content here...'
      ],
      fetchedAt: '2025-03-07T11:26:11-05:00',
      chunkSize: 1000
    }
  }
  */
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

/**
 * Get website content for a specific URL
 * @param {string} url - The URL to get content for
 * @returns {Object|null} The website content with chunks, if available
 */
function getWebsiteContent(url) {
  return context.websiteContent[url] || null;
}

/**
 * Store website content for a specific URL
 * @param {string} url - The URL to store content for
 * @param {Object} content - The content object with chunks and metadata
 */
function storeWebsiteContent(url, content) {
  context.websiteContent[url] = content;
}

/**
 * Get all stored website content
 * @returns {Object} All stored website content by URL
 */
function getAllWebsiteContent() {
  return context.websiteContent;
}

/**
 * Clear website content for a specific URL
 * @param {string} url - The URL to clear content for
 */
function clearWebsiteContent(url) {
  if (url) {
    delete context.websiteContent[url];
  } else {
    context.websiteContent = {};
  }
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
  getWebsiteContent,
  storeWebsiteContent,
  getAllWebsiteContent,
  clearWebsiteContent,
};
