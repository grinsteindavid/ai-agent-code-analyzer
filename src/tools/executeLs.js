const { exec } = require("child_process");

// JSON Schema Definition
const lsSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Directory path to list" },
    options: { type: "string", description: "Options for ls command" },
  },
  required: ["path"],
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
