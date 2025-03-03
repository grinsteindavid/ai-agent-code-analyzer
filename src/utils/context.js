/**
 * Application context - stores global variables
 */
const context = {
  currentDirectory: process.cwd(),
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

module.exports = {
  context,
  getCurrentDirectory,
  setCurrentDirectory,
};
