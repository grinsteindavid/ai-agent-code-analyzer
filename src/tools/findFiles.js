const { exec } = require("child_process");

// JSON Schema Definition
const findFilesSchema = {
  type: "object",
  properties: {
    pattern: { type: "string", description: "Pattern to match file names (supports glob patterns)" },
    path: { type: "string", description: "Directory path to search within" },
    options: { type: "string", description: "Additional options for the find command" },
    type: { type: "string", description: "Type of items to find: 'f' for files, 'd' for directories, or empty for both" },
  },
  required: ["pattern", "path"],
  additionalProperties: false,
};

// Function to find files by pattern
function findFiles(pattern, path = ".", options = "", type = "") {
  return new Promise((resolve, reject) => {
    let command = `find ${path} -name "${pattern}"`;
    
    // Add type filter if specified
    if (type) {
      command += ` -type ${type}`;
    }
    
    // Add any additional options
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
