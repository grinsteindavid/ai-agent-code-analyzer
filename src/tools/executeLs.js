const { exec } = require("child_process");
const { validateSchema } = require("../utils/validation");

// JSON Schema Definition
const lsSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Directory path to list", default: "." },
    options: { type: "string", description: "Options for ls command" },
  },
  required: [],
  additionalProperties: false,
};

// Function to execute `ls`
function executeLs(path = ".", options = "") {
  return new Promise((resolve, reject) => {
    exec(`ls ${options} ${path}`, (err, stdout, stderr) => {
      if (err) reject({ error: stderr });
      else resolve({ directories: stdout.split("\n").filter(Boolean) });
    });
  });
}

module.exports = {
  executeLs,
  lsSchema
};
