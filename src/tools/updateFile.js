const fs = require('fs');

// JSON Schema Definition
const updateFileSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['filePath', 'content', 'updateMode'],
  properties: {
    filePath: {
      type: 'string',
      description: 'Path of the file to update'
    },
    content: {
      type: 'string',
      description: 'New content to write to the file'
    },
    updateMode: {
      type: 'string',
      enum: ['overwrite', 'append', 'prepend'],
      default: 'overwrite',
      description: 'Mode of update: overwrite (default), append to end, or prepend to beginning'
    }
  },
  description: 'Updates the content of an existing file. Can overwrite entirely or append/prepend content. Always check file content before updating to avoid errors.',
 
};

/**
 * Updates a file with various modes: overwrite entirely, append to the end, or prepend to the beginning
 * @param {string} filePath - Path of the file to update
 * @param {string} content - Content to write to the file
 * @param {string} [updateMode='overwrite'] - Mode of update: 'overwrite', 'append', or 'prepend'
 * @returns {Promise<Object>} Result object with status and updated file information
 */
function updateFile(filePath, content, updateMode = 'overwrite') {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return reject({
        status: 'error',
        path: filePath,
        error: 'File does not exist'
      });
    }

    try {
      let newContent = content;
      
      // Handle different update modes
      if (updateMode === 'append' || updateMode === 'prepend') {
        // Read existing content
        const existingContent = fs.readFileSync(filePath, 'utf8');
        
        if (updateMode === 'append') {
          newContent = existingContent + content;
        } else if (updateMode === 'prepend') {
          newContent = content + existingContent;
        }
      }
      
      // Write the new content to the file
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      // Get updated file stats
      const stats = fs.statSync(filePath);
      
      resolve({
        status: 'success',
        path: filePath,
        size: stats.size,
        updated: new Date(stats.mtime).toISOString(),
        updateMode
      });
    } catch (error) {
      reject({
        status: 'error',
        path: filePath,
        error: error.message
      });
    }
  });
}

module.exports = {
  updateFile,
  updateFileSchema
};
