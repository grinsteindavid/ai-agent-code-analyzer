const fs = require('fs');
const path = require('path');

// JSON Schema Definition
const listDirectoriesSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Absolute directory path to list" },
    options: {
      type: "string",
      enum: ["a", "l", "al"],
      description: "Options: 'l' for detailed format, 'al' for all files (including hidden), default to l"
    },
  },
  required: ["path", "options"],
  additionalProperties: false,
  description: "It returns a list of files and directories in the specified path.",
};

/**
 * List directory contents using native Node.js fs module
 * @param {Object} args - Arguments object
 * @param {string} args.path - Directory path to list
 * @param {string} args.options - Options string ('a' for all files, 'l' for detailed format)
 * @returns {Promise<Object>} - Resolved with an object containing directories array
 */
function listDirectories(args) {
  const { path: dirPath = ".", options = "" } = args;
  return new Promise((resolve, reject) => {
    try {
      // Read directory contents
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      let files = [];
      
      // Process according to options
      const showHidden = options.includes('a');
      const showDetailed = options.includes('l');
      
      for (const entry of entries) {
        // Skip hidden files unless 'a' option is specified
        if (!showHidden && entry.name.startsWith('.')) {
          continue;
        }
        
        if (showDetailed) {
          try {
            const entryPath = path.join(dirPath, entry.name);
            const stats = fs.statSync(entryPath);
            
            files.push({
              name: entry.name,
              type: entry.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime.toISOString(),
              permissions: stats.mode.toString(8).slice(-3)
            });
          } catch (err) {
            // If we can't stat a file (e.g., permission issues), just include basic info
            files.push({ name: entry.name, type: 'unknown' });
          }
        } else {
          // Simple format just includes names
          files.push(entry.name);
        }
      }
      
      resolve({ directories: showDetailed ? files : files.sort(), metadata: { total: files.length } });
    } catch (error) {
      reject({ error: error.message });
    }
  });
}

module.exports = {
  listDirectories,
  listDirectoriesSchema
};
