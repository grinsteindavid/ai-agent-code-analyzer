const { exec } = require("child_process");

// JSON Schema Definition
const searchGrepSchema = {
  type: "object",
  properties: {
    pattern: { type: "string", description: "Linux Grep command Pattern to search for" },
    path: { type: "string", description: "Folder Path to search within" },
    options: { type: "string", description: "Multiple Options for Linux Grep command" },
  },
  required: ["pattern", "path"],
  additionalProperties: false,
};

// Function to execute grep search
function searchGrep(pattern, path = ".", options = "-r") {
  return new Promise((resolve, reject) => {
    exec(`grep ${options.includes('-r') ? options : `${options} -r`} "${pattern}" ${path}`, (err, stdout, stderr) => {
      // grep returns exit code 1 when no matches found, which is not an error for our use case
      if (err && err.code !== 1) {
        reject({ error: stderr || err.message });
      } else {
        const results = stdout ? stdout.split("\n").filter(Boolean) : [];
        resolve({ matches: results });
      }
    });
  });
}

module.exports = {
  searchGrep,
  searchGrepSchema
};
