const fs = require('fs');

// JSON Schema Definition
const updateFileSchema = {
  type: "object",
  properties: {
    filePath: { 
      type: "string", 
      description: "Path of the file to update" 
    },
    changes: { 
      type: "array",
      items: {
        type: "object",
        properties: {
          lineStart: { 
            type: "integer", 
            description: "Line number to start updating (0-indexed)" 
          },
          lineEnd: { 
            type: "integer", 
            description: "Line number to end updating (0-indexed)" 
          },
          newContent: { 
            type: "string", 
            description: "New content to replace the specified lines. Must maintain proper syntax for the file format (e.g., valid JSON if updating a JSON file). For JSON files, ensure proper quoting, escaping, and structure preservation." 
          }
        },
        required: ["lineStart", "lineEnd", "newContent"],
        additionalProperties: false
      },
      description: "Array of changes to make to the file. For structured files (JSON, code, etc.), ensure each change preserves the file's syntax and structure."
    }
  },
  required: ["filePath", "changes"],
  description: "This is a tool that updates and appends specific lines in a file with multiple changes. Preserve file structure and format when making changes, especially for structured formats like JSON, XML, or code files. Always ensure newContent maintains the proper syntax and indentation of the original file format.",
  additionalProperties: false,
};

/**
 * Updates specific lines in a file with multiple changes
 * @param {string} filePath - Path of the file to update
 * @param {Array} changes - Array of changes to make to the file
 * @param {number} changes[].lineStart - Line number to start updating (0-indexed)
 * @param {number} changes[].lineEnd - Line number to end updating (0-indexed)
 * @param {string} changes[].newContent - New content to replace the specified lines. When updating structured files
 *                                       like JSON, ensure content maintains valid syntax and formatting.
 * @returns {Promise<Object>} Result object with status and updated file information
 */
function updateFile(filePath, changes) {
  return new Promise((resolve, reject) => {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        reject({
          status: 'error',
          path: filePath,
          message: `File does not exist at ${filePath}`
        });
        return;
      }

      // Read the file content
      const content = fs.readFileSync(filePath, 'utf8');
      let lines = content.split('\n');
      
      // Sort changes by lineStart in descending order to prevent indices from shifting
      const sortedChanges = [...changes].sort((a, b) => b.lineStart - a.lineStart);
      
      // Validate and apply each change
      const appliedChanges = [];
      
      for (const change of sortedChanges) {
        const { lineStart, lineEnd, newContent } = change;
        
        // Validate line ranges
        if (lineStart < 0 || lineStart >= lines.length) {
          reject({
            status: 'error',
            path: filePath,
            message: `Invalid lineStart: ${lineStart}. File has ${lines.length} lines.`
          });
          return;
        }

        if (lineEnd < lineStart || lineEnd >= lines.length) {
          reject({
            status: 'error',
            path: filePath,
            message: `Invalid lineEnd: ${lineEnd}. File has ${lines.length} lines and lineEnd must be >= lineStart.`
          });
          return;
        }
        
        // Apply the change
        const newLines = newContent.split('\n');
        lines = [
          ...lines.slice(0, lineStart),
          ...newLines,
          ...lines.slice(lineEnd + 1)
        ];
        
        appliedChanges.push({
          lineStart,
          lineEnd,
          linesChanged: (lineEnd - lineStart + 1),
          newLineCount: newLines.length
        });
      }

      // Write the updated content back to the file
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

      resolve({
        status: 'success',
        path: filePath,
        changesApplied: appliedChanges.length,
        changes: appliedChanges,
        message: `Successfully applied ${appliedChanges.length} changes to ${filePath}`
      });
    } catch (error) {
      reject({
        status: 'error',
        path: filePath,
        error: error.message || 'Failed to update file'
      });
    }
  });
}

module.exports = {
  updateFile,
  updateFileSchema
};
