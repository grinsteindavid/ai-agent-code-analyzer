const fs = require("fs");

// JSON Schema Definition
const readFileSchema = {
  type: "object",
  required: ["path", "encoding"],
  additionalProperties: false,
  properties: {
    path: { type: "string", description: "Absolute path of the file to read" },
    encoding: { type: "string", description: "Encoding type, default utf-8" },
  },
  description: "Reads and returns the contents of a file at the specified path.",
};

// Function to read a file
function readFile(args) {
  const { path, encoding = "utf-8" } = args;
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) reject({ error: err.message });
      else resolve({ content: data });
    });
  });
}

module.exports = {
  readFile,
  readFileSchema
};
