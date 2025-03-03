require('dotenv').config();
const { Command } = require("commander");

// Import utilities
const { tools, executeTool } = require("./utils/tools");
const { getCurrentDirectory } = require("./utils/context");

// Import providers
const { getAiFunctionCall } = require("./providers/openai");

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
