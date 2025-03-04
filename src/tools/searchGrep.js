const { exec } = require("child_process");

// JSON Schema Definition
const searchGrepSchema = {
  type: "object",
  properties: {
    pattern: { type: "string", description: "Grep command Pattern to search for. ONLY USE PATTERNS THAT JSON.parse() will accept" },
    path: { type: "string", description: "Directory Path to search within" },
    options: { type: "string", description: "Options for grep command"},
  },
  required: ["pattern", "path", "options"],
  additionalProperties: false,
};

// Function to execute grep search
function searchGrep(pattern, path = ".", options = "") {
  return new Promise((resolve, reject) => {
    exec(`grep ${options} "${pattern}" ${path}`, (err, stdout, stderr) => {
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
