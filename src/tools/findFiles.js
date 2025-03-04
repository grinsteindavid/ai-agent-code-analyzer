const { exec } = require("child_process");

/**
 * JSON Schema for find_files function parameters.
 * Defines the structure and validation rules for the input parameters.
 */
const findFilesSchema = {
  type: "object",
  properties: {
    pattern: { 
      type: "string", 
      description: "Pattern to match file names (supports glob patterns like *.js, *.md, etc.)"
    },
    path: { 
      type: "string", 
      description: "Directory path to search within (absolute or relative to current directory)"
    },
    options: { 
      type: "string", 
      description: "Additional options for the find command (e.g., '-maxdepth 2' to limit search depth)"
    },
    type: { 
      type: "string", 
      description: "Type of items to find: 'f' for regular files, 'd' for directories, 'l' for symbolic links, etc."
    },
  },
  required: ["pattern", "path"],
  additionalProperties: false,
  description: "Schema for validating the input parameters of the find_files function."
};

/**
 * Finds files or directories matching a specified pattern within a given path.
 * 
 * @param {string} pattern - The filename pattern to search for (e.g., "*.js", "data.*")
 * @param {string} path - The base directory to start the search from (defaults to current directory)
 * @param {string} options - Additional options for the find command (e.g., "-maxdepth 3")
 * @param {string} type - Filter by file type: 'f' for files, 'd' for directories, etc.
 * @returns {Promise<Object>} A promise that resolves to an object with a files array containing matching paths
 */
function findFiles(pattern, path = ".", options = "", type = "") {
  return new Promise((resolve, reject) => {
    // Construct the base find command with path and pattern
    let command = `find "${path}" -name "${pattern}"`;
    
    // Add type filter if specified
    // File type options:
    // - f: regular file
    // - d: directory
    // - l: symbolic link
    // - b: block special device
    // - c: character special device
    // - p: named pipe (FIFO)
    // - s: socket
    if (type) {
      command += ` -type ${type}`;
    }
    
    // Add any additional options (e.g., -maxdepth, -mindepth, -size, etc.)
    if (options) {
      command += ` ${options}`;
    }
    
    // Execute the find command
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject({ error: stderr || err.message });
      } else {
        const files = stdout ? stdout.split("\n").filter(Boolean) : [];
        resolve({ files: files });
      }
    });
  });
}

module.exports = {
  findFiles,
  findFilesSchema
};
