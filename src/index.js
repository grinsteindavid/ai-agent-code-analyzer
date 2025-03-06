#!/usr/bin/env node

require('dotenv').config();
const { Command } = require("commander");

// Import utilities
const { executeTool, getFunctionSchemas } = require("./utils/tools");

// Import providers
const { providers } = require("./providers");
const { setPlan, addMessage } = require('./utils/context');

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
    const functionSchemas = getFunctionSchemas();
    
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
    console.log("\n", plan, "\n");
    
    // Add the plan to context for function calls to access
    setPlan(plan);
    
    // Then proceed with function calls in a loop until completion
    let functionCall;
    
    do {
      
      try {
        // Get the next thought based on the plan and previous messages
        const nextThought = await selectedProvider.getNextThought();

        if(!nextThought) {
          console.error("Error getting next thought");
          return;
        }
        
        // Get the next function call using the nextThought
        functionCall = await selectedProvider.getFunctionCall({
          functions: functionSchemas,
          nextThought: nextThought,
        });
        
        // Execute the function if we have one
        if (functionCall) {
          addMessage('assistant', `${nextThought}`);
          console.log(`\n ** ${nextThought}`);
          console.log(`\n-- Tool: ${functionCall.name}`);
          console.log(`-- Arguments: ${JSON.stringify(functionCall.arguments)}\n`);
          await executeTool(functionCall.name, functionCall.arguments);
        } else {
          console.log("\n Generating summary... \n");
          const summary = await selectedProvider.getSummary();
          console.log(summary);
        }
      } catch (error) {
        console.error(`Retrying...`, error);
      }
    } while (functionCall); // Continue until no more function calls

  });

program.parse(process.argv);
