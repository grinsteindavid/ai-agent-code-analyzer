const { exec } = require("child_process");

// JSON Schema Definition
const lsSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Directory path to list" },
    options: { type: "string", description: "The ls command in Linux many options" },
  },
  required: ["path", "options"],
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
