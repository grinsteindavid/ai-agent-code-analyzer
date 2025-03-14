const fs = require('fs');
const path = require('path');

// JSON Schema Definition
const createFileSchema = {
  type: "object",
  required: ["filePath", "content", "encoding"],
  additionalProperties: false,
  properties: {
    filePath: { type: "string", description: "Path where the file should be created, absolute paths only" },
    content: { type: "string", description: "Content to write to the file, respecting end of lines, structure and format" },
    encoding: { type: "string", description: "Encoding type, default utf-8" },
  },
  description: "Creates a new file with the specified content at the given path if it does not exist. If the file already exists, it will be skipped.",
};

/**
 * Creates a file with the specified content
 * @param {string} filePath - Path where the file should be created
 * @param {string} content - Content to write to the file
 * @param {string} [encoding='utf-8'] - Encoding type, default utf-8
 * @returns {Promise<Object>} Result object with status and path
 */
function createFile(filePath, content, encoding = 'utf-8') {
  return new Promise((resolve, reject) => {
    // Ensure the directory exists
    const directory = path.dirname(filePath);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      reject({
        status: 'warning',
        path: filePath,
        message: `File already exists at ${filePath}. Skipping creation.`
      });
      return;
    }
    
    // Create directory recursively if it doesn't exist
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Write content to the file
    fs.writeFileSync(filePath, content, encoding);
    
    resolve({
      status: 'success',
      path: filePath,
      message: `File created successfully at ${filePath}`
    });
  });
}

module.exports = {
  createFile,
  createFileSchema
};
