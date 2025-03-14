#!/usr/bin/env node

require('dotenv').config();

const { Command } = require("commander");
const inquirer = require('inquirer');

// Import utilities
const { executeTool, getFunctionSchemas } = require("./utils/tools");
const logger = require('./utils/logger');

// Import providers
const { providers } = require("./providers");
const { setPlan, addMessage, setDebug } = require('./utils/context');

// CLI Setup
const program = new Command();
program.name("AI CLI Agent").description("AI-powered CLI tool").version("1.0.0");

/**
 * Generate an execution plan using OpenAI
 * @param {Object} options - Options object
 * @param {string} options.query - The user's query
 * @param {Object} options.selectedProvider - The selected AI provider
 * @param {boolean} options.includePastConversation - Whether to include the past conversation in the plan
 * @returns {Promise<String>} - The generated plan with steps to execute
 */
const generatePlan = async (options) => {
   // First, generate a plan using the getPlan function
   logger.info(" Generating plan...");
   const plan = await options.selectedProvider.getPlan({
     userInput: options.query,
     includePastConversation: options.includePastConversation
   });

   if(!plan) {
     logger.error( "Error generating plan");
     return null;
   }
   
   // Log the generated plan
   logger.info(` ${plan}\n`);
   
   // Add the plan to context for function calls to access
   setPlan(plan);

   return plan;
}

// AI analyze command
program
  .command("analyze")
  .description("Analyze your codebase using AI")
  .requiredOption("-q, --query <query>", "Question about your codebase")
  .option("-p, --provider <provider>", "AI provider to use (openai)", "openai")
  .option("-d, --debug", "Enable debug mode", false)
  .action(async (options) => {
    const { query, provider, debug } = options;
    
    // Set debug flag in global context
    setDebug(debug);
    
    // Select the AI provider
    const selectedProvider = providers[provider];
    if (!selectedProvider) {
      logger.error(` Unknown provider: ${provider}. Available providers: ${Object.keys(providers).join(', ')}`);
      return;
    }
    
    // Get available tool schemas for AI
    const functionSchemas = getFunctionSchemas();
    
    // Generate a plan
    await generatePlan({ query, selectedProvider });
    
    // Then proceed with function calls in a loop until completion
    let functionCall;
    
    do {
      
      try {
        // Get the next thought based on the plan and previous messages
        const nextThought = await selectedProvider.getNextThought();

        if(!nextThought) {
          logger.error(" Error getting next thought");
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
          logger.info(` ${nextThought}\n`);
          
          logger.debug(` Tool: ${functionCall.name}`);
          logger.debug(` Arguments: ${JSON.stringify(functionCall.arguments)}\n`);
          
          const result = await executeTool(functionCall.name, functionCall.arguments);
          addMessage('user', `${result}`);
          continue;
        }

        // Ask the user if they want to continue or finish
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'The current goal looks finished. Would you like to add another task to the current conversation or get a summary?',
            choices: ['Add task', 'Get summary', 'Finish'],
          },
        ]);
        
        if (action === 'Add task') {
          // User wants to continue, ask for additional input
          const { query } = await inquirer.prompt([
            {
              type: 'input',
              name: 'query',
              message: 'Please provide the new task:',
            },
          ]);
          await generatePlan({ query, includePastConversation: true, selectedProvider });
          functionCall = true;
        } else if (action === 'Finish conversation') {
          // User wants to finish, break the loop
          process.exit(0);
        }
      } catch (error) {
        logger.error(`Retrying... ${error}`)
      }
    } while (functionCall); // Continue until no more function calls

    logger.info(" Generating summary... \n");
    const summary = await selectedProvider.getSummary();
    logger.info(` ${summary}`);

  });

program.parse(process.argv);
