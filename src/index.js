require('dotenv').config();
const { Command } = require("commander");

// Import utilities
const { tools, executeTool } = require("./utils/tools");
const { getCurrentDirectory } = require("./utils/context");

// Import providers
const { providers } = require("./providers");

// CLI Setup
const program = new Command();
program.name("AI CLI Agent").description("AI-powered CLI tool").version("1.0.0");

// AI command
program
  .command("analyze")
  .description("Analyze your codebase using AI")
  .requiredOption("-q, --query <query>", "Question about your codebase")
  .option("-m, --max-tokens <number>", "Maximum tokens in the GPT-4 response", 4000)
  .option("-p, --provider <provider>", "AI provider to use (openai)", "openai")
  .action(async (options) => {
    const { query, maxTokens, provider } = options;
    
    // Get the current directory
    const currentDirectory = getCurrentDirectory();
    
    // Select the AI provider
    const selectedProvider = providers[provider];
    if (!selectedProvider) {
      console.error(`Unknown provider: ${provider}. Available providers: ${Object.keys(providers).join(', ')}`);
      return;
    }
    
    // Get available tool schemas for AI
    const functionSchemas = Object.entries(tools).map(([name, { schema }]) => ({
      name,
      parameters: schema
    }));
    
    const functionCall = await selectedProvider.getAiFunctionCall(query, maxTokens, functionSchemas);
    
    if (!functionCall) return;
    
    await executeTool(functionCall.name, functionCall.arguments);
  });

program.parse(process.argv);
