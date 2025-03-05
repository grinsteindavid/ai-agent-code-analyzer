const fs = require('fs');
const path = require('path');

// JSON Schema Definition
const createFileSchema = {
  type: "object",
  properties: {
    filePath: { type: "string", description: "Path where the file should be created" },
    content: { type: "string", description: "Content to write to the file" },
  },
  required: ["filePath", "content"],
  description: "Creates a new file with the specified content at the given path.",
  additionalProperties: false,
};

/**
 * Creates a file with the specified content
 * @param {string} filePath - Path where the file should be created
 * @param {string} content - Content to write to the file
 * @returns {Promise<Object>} Result object with status and path
 */
function createFile(filePath, content) {
  return new Promise((resolve, reject) => {
    // Ensure the directory exists
    const directory = path.dirname(filePath);
    
    try {
      // Check if file already exists
      if (fs.existsSync(filePath)) {
        resolve({
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
      fs.writeFileSync(filePath, content, 'utf8');
      
      resolve({
        status: 'success',
        path: filePath,
        message: `File created successfully at ${filePath}`
      });
    } catch (error) {
      reject({
        error: error.message || 'Failed to create file'
      });
    }
  });
}

module.exports = {
  createFile,
  createFileSchema
};
