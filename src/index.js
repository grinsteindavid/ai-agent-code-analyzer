require('dotenv').config();
const { Command } = require("commander");

// Import utilities
const { tools, executeTool } = require("./utils/tools");

// Import providers
const { providers } = require("./providers");
const { addMessage, getCurrentDirectory, getMessages } = require('./utils/context');

// CLI Setup
const program = new Command();
program.name("AI CLI Agent").description("AI-powered CLI tool").version("1.0.0");

// AI analyze command
program
  .command("analyze")
  .description("Analyze your codebase using AI")
  .requiredOption("-q, --query <query>", "Question about your codebase")
  .option("-m, --max-tokens <number>", "Maximum tokens in the GPT-4 response", 4000)
  .option("-p, --provider <provider>", "AI provider to use (openai)", "openai")
  .action(async (options) => {
    const { query, maxTokens, provider } = options;
    
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

    addMessage('system', `You are an AI code analyzer. You can only use tools provided and can only answer questions about your codebase. Current directory: ${getCurrentDirectory()}`);
    
    const functionCall = await selectedProvider.getFunctionCall({
      userInput: query,
      maxTokens: maxTokens,
      functions: functionSchemas,
    });
    
    if (!functionCall) return;
    
    await executeTool(functionCall.name, functionCall.arguments);

  });

program.parse(process.argv);
