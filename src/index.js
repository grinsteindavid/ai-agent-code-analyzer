const { exec } = require("child_process");
const fs = require("fs");
const { Command } = require("commander");
const { OpenAI } = require("openai");
const Ajv = require("ajv");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: "YOUR_OPENAI_API_KEY" });

// JSON Schema Definitions
const lsSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Directory path to list", default: "." },
    options: { type: "string", description: "Options for ls command" },
  },
  required: [],
  additionalProperties: false,
};

const readFileSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Path of the file to read" },
    encoding: { type: "string", description: "Encoding type", default: "utf-8" },
  },
  required: ["path"],
  additionalProperties: false,
};

// Function to validate JSON input against schema
function validateSchema(data, schema) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  return validate(data);
}

// Function to execute `ls`
function executeLs(path = ".", options = "") {
  return new Promise((resolve, reject) => {
    exec(`ls ${options} ${path}`, (err, stdout, stderr) => {
      if (err) reject({ error: stderr });
      else resolve({ directories: stdout.split("\n").filter(Boolean) });
    });
  });
}

// Function to read a file
function readFile(path, encoding = "utf-8") {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) reject({ error: err.message });
      else resolve({ content: data });
    });
  });
}

// Function to call OpenAI API and get JSON function response
async function getAiFunctionCall(userInput) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: userInput }],
      functions: [
        { name: "ls", parameters: lsSchema },
        { name: "readFile", parameters: readFileSchema },
      ],
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (functionCall) {
      return JSON.parse(functionCall.arguments);
    } else {
      console.log("No valid function call generated.");
      return null;
    }
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    return null;
  }
}

// CLI Setup
const program = new Command();
program.name("AI CLI Agent").description("AI-powered CLI tool").version("1.0.0");

// AI command
program
  .command("ai <query>")
  .description("Ask the AI agent to perform an action")
  .action(async (query) => {
    const functionCall = await getAiFunctionCall(query);
    if (!functionCall) return;

    if (functionCall.name === "ls") {
      const { path, options } = functionCall;
      if (validateSchema({ path, options }, lsSchema)) {
        executeLs(path, options)
          .then((result) => console.log("Directories:", result.directories))
          .catch((error) => console.error("Error:", error.error));
      } else {
        console.error("Invalid arguments for `ls`.");
      }
    } else if (functionCall.name === "readFile") {
      const { path, encoding } = functionCall;
      if (validateSchema({ path, encoding }, readFileSchema)) {
        readFile(path, encoding)
          .then((result) => console.log("File Content:\n", result.content))
          .catch((error) => console.error("Error:", error.error));
      } else {
        console.error("Invalid arguments for `readFile`.");
      }
    } else {
      console.log("Unknown function call.");
    }
  });

program.parse(process.argv);
