require('dotenv').config();
const { Command } = require("commander");

// Import utilities
const { tools, executeTool } = require("./utils/tools");

// Import providers
const { providers } = require("./providers");
const { setPlan } = require('./utils/context');

// CLI Setup
const program = new Command();
program.name("AI CLI Agent").description("AI-powered CLI tool").version("1.0.0");

// AI analyze command
program
  .command("analyze")
  .description("Analyze your codebase using AI")
  .requiredOption("-q, --query <query>", "Question about your codebase")
  .option("-p, --provider <provider>", "AI provider to use (openai)", "openai")
  .action(async (options) => {
    const { query, provider } = options;
    
    // Select the AI provider
    const selectedProvider = providers[provider];
    if (!selectedProvider) {
      console.error(`Unknown provider: ${provider}. Available providers: ${Object.keys(providers).join(', ')}`);
      return;
    }
    
    // Get available tool schemas for AI
    const functionSchemas = Object.entries(tools).map(([name, { schema, description }]) => ({
      type: "function",
      function: {
        name,
        description: description || `Execute the ${name} function`,
        parameters: schema
      }
    }));
    
    // First, generate a plan using the getPlan function
    console.log("Generating plan...");
    const plan = await selectedProvider.getPlan({
      userInput: query
    });

    if(!plan) {
      console.log("Error generating plan");
      return;
    }
    
    // Log the generated plan
    console.log("\n", plan);
    
    // Add the plan to context for function calls to access
    setPlan(plan);
    
    // Then proceed with function calls in a loop until completion
    let functionCall;
    let stepCount = 1;
    
    do {
      console.log(`\nExecuting step ${stepCount}...`);
      
      // Get the next function call
      functionCall = await selectedProvider.getFunctionCall({
        functions: functionSchemas,
      });
      
      // Execute the function if we have one
      if (functionCall) {
        console.log(`Tool: ${functionCall.name}`);
        console.log(`Arguments: ${JSON.stringify(functionCall.arguments)}\n`);
        await executeTool(functionCall.name, functionCall.arguments);
        stepCount++;
      } else {
        const summary = await selectedProvider.getSummary();
        console.log(summary);
      }
    } while (functionCall); // Continue until no more function calls

  });

program.parse(process.argv);
