require('dotenv').config();
const { Command } = require("commander");
const { OpenAI } = require("openai");

// Import tools
const { executeLs, lsSchema } = require("./tools/executeLs");
const { readFile, readFileSchema } = require("./tools/readFile");
const { validateSchema } = require("./utils/validation");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to call OpenAI API and get JSON function response
async function getAiFunctionCall(userInput, maxTokens = 4000) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: userInput }],
      max_tokens: maxTokens,
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
  .command("analyze")
  .description("Analyze your codebase using AI")
  .requiredOption("-q, --query <query>", "Question about your codebase")
  .option("-m, --max-tokens <number>", "Maximum tokens in the GPT-4 response", 4000)
  .action(async (options) => {
    const { query, maxTokens } = options;
    const functionCall = await getAiFunctionCall(query, maxTokens);
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
