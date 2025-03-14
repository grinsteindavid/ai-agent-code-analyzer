const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * JSON Schema for find_files function parameters.
 * Defines the structure and validation rules for the input parameters.
 */
const findFilesSchema = {
  type: "object",
  required: ["pattern", "dirPath", "type", "options"],
  additionalProperties: false,
  properties: {
    pattern: { 
      type: "string", 
      description: "Pattern to match file names (supports glob patterns like *.js, *.md, etc.)"
    },
    dirPath: { 
      type: "string", 
      description: "Directory path to search within (absolute or relative to current directory)"
    },
    options: { 
      type: "string", 
      description: "Additional options like maxDepth (e.g., 'maxDepth=2' to limit search depth)"
    },
    type: { 
      type: "string", 
      enum: ["f", "d", "l"],
      description: "Type of items to find: 'f' for regular files, 'd' for directories, 'l' for symbolic links"
    },
  },
  description: "It returns a list of files and directories matching a pattern in the specified directory path.",
 
};

/**
 * Converts a glob pattern to a regular expression
 * 
 * @param {string} pattern - The glob pattern to convert (e.g., "*.js")
 * @returns {RegExp} A regular expression that matches the glob pattern
 */
function globToRegExp(pattern) {
  // Escape all regexp special characters except * and ?
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  // Convert * to match any character (except directory separators)
  const converted = escaped.replace(/\*/g, '[^/\\\\]*')
    // Convert ? to match a single character
    .replace(/\?/g, '[^/\\\\]');
  // Create a RegExp that matches the entire string
  return new RegExp(`^${converted}$`);
}

/**
 * Check if a file matches the specified type
 * 
 * @param {string} filePath - Path to the file
 * @param {string} type - Type of item to match ('f', 'd', 'l', etc.)
 * @returns {boolean} Whether the file matches the specified type
 */
function matchesType(filePath, type) {
  try {
    const stat = fs.lstatSync(filePath);
    switch (type) {
      case 'f': return stat.isFile();
      case 'd': return stat.isDirectory();
      case 'l': return stat.isSymbolicLink();
      default: return true;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Parse options string into an options object
 * 
 * @param {string} optionsStr - Options string (e.g., "maxDepth=3")
 * @returns {Object} Parsed options object
 */
function parseOptions(optionsStr) {
  const options = { maxDepth: Infinity };
  
  if (optionsStr) {
    optionsStr.split(' ').forEach(opt => {
      const [key, value] = opt.split('=');
      if (key === 'maxDepth' && !isNaN(value)) {
        options.maxDepth = parseInt(value, 10);
      }
    });
  }
  
  return options;
}

/**
 * Recursively finds files or directories matching a specified pattern within a given path.
 * 
 * @param {string} pattern - The filename pattern to search for (e.g., "*.js", "data.*")
 * @param {string} dirPath - The base directory to start the search from (defaults to current directory)
 * @param {string} options - Additional options (e.g., "maxDepth=3")
 * @param {string} type - Filter by file type: 'f' for files, 'd' for directories, 'l' for symbolic links
 * @returns {Promise<Object>} A promise that resolves to an object with a files array containing matching paths
 */
function findFiles(pattern, dirPath = ".", options = "", type = "") {
  return new Promise((resolve, reject) => {
    try {
      const parsedOptions = parseOptions(options);
      const patternRegex = globToRegExp(pattern);
      const results = [];
      const errors = {
        accessErrors: [],
        traverseErrors: []
      };
      
      // Define the recursive function to traverse directories
      function traverseDirectory(currentPath, depth = 0) {
        if (depth > parsedOptions.maxDepth) return;
        
        let entries = [];
        try {
          entries = fs.readdirSync(currentPath, { withFileTypes: true });
        } catch (err) {
          // Handle permission errors or other file system errors
          const errorMsg = `Could not access directory ${currentPath}: ${err.message}`;
          errors.accessErrors.push(errorMsg);
          return; // Skip this directory and continue with others
        }
        
        for (const entry of entries) {
          const entryPath = path.join(currentPath, entry.name);
          
          // Check if the entry name matches the pattern
          if (patternRegex.test(entry.name)) {
            // Check if the entry matches the specified type
            if (!type || matchesType(entryPath, type)) {
              results.push(entryPath);
            }
          }
          
          // Recursively traverse subdirectories
          if (entry.isDirectory()) {
            try {
              traverseDirectory(entryPath, depth + 1);
            } catch (err) {
              // Handle any errors during directory traversal
              const errorMsg = `Error traversing ${entryPath}: ${err.message}`;
              logger.debug(errorMsg);
              errors.traverseErrors.push(errorMsg);
            }
          }
        }
      }
      
      // Start the traversal from the specified path
      traverseDirectory(dirPath);
      resolve({ 
        files: results, 
        metadata: { 
          total: results.length,
          errors: errors.accessErrors.length > 0 || errors.traverseErrors.length > 0 ? errors : undefined
        } 
      });
      
    } catch (error) {
      reject({ error: error.message });
    }
  });
}

module.exports = {
  findFiles,
  findFilesSchema
};
