require('dotenv').config();
const { Command } = require("commander");

// Import tools
const { executeLs, lsSchema } = require("./tools/executeLs");
const { readFile, readFileSchema } = require("./tools/readFile");
const { validateSchema } = require("./utils/validation");

// Import providers
const { getAiFunctionCall } = require("./providers/openai");

// Define available tools and their schemas
const tools = {
  ls: {
    schema: lsSchema,
    execute: executeLs,
    formatResult: (result) => console.log("Directories:", result.directories)
  },
  readFile: {
    schema: readFileSchema,
    execute: readFile,
    formatResult: (result) => console.log("File Content:\n", result.content)
  }
};

// Generic function to execute a tool
async function executeTool(toolName, args) {
  const tool = tools[toolName];
  if (!tool) {
    console.log(`Unknown tool: ${toolName}`);
    return;
  }

  if (!validateSchema(args, tool.schema)) {
    console.error(`Invalid arguments for '${toolName}'.`);
    return;
  }

  try {
    const result = await tool.execute(...Object.values(args));
    tool.formatResult(result);
  } catch (error) {
    console.error("Error:", error.error || error.message);
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
    
    // Get available tool schemas for AI
    const functionSchemas = Object.entries(tools).map(([name, { schema }]) => ({
      name,
      parameters: schema
    }));
    
    const functionCall = await getAiFunctionCall(query, maxTokens, functionSchemas);
    
    if (!functionCall) return;
    
    await executeTool(functionCall.name, functionCall.arguments);
  });

program.parse(process.argv);
