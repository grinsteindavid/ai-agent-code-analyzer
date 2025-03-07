const fs = require('fs');

// JSON Schema Definition
const updateFileSchema = {
  type: 'object',
  required: ['filePath', 'content'],
  properties: {
    filePath: {
      type: 'string',
      description: 'Path of the file to update'
    },
    content: {
      type: 'string',
      description: 'New content to write to the file'
    }
  },
  description: 'Updates the entire content of an existing file (respect end of lines).',
  additionalProperties: false
};

/**
 * Updates the entire content of an existing file
 * @param {string} filePath - Path of the file to update
 * @param {string} content - New content to write to the file
 * @returns {Promise<Object>} Result object with status and updated file information
 */
function updateFile(filePath, content) {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return reject({
        status: 'error',
        path: filePath,
        error: 'File does not exist'
      });
    }

    // Write the new content to the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Get updated file stats
    const stats = fs.statSync(filePath);
    
    resolve({
      status: 'success',
      path: filePath,
      size: stats.size,
      updated: new Date(stats.mtime).toISOString()
    });
  });
}

module.exports = {
  updateFile,
  updateFileSchema
};
