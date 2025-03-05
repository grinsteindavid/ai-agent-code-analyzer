const fs = require("fs");

// JSON Schema Definition
const readFileSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Path of the file to read" },
    encoding: { type: "string", description: "Encoding type", default: "utf-8" },
  },
  required: ["path"],
  description: "Reads and returns the contents of a file at the specified path.",
  additionalProperties: false,
};

// Function to read a file
function readFile(path, encoding = "utf-8") {
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
