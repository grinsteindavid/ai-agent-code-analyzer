const { OpenAI } = require("openai");
const { setPlan, getCurrentDirectory } = require("../../utils/context");
const { tools } = require("../../utils/tools");
const logger = require("../../utils/logger");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an execution plan using OpenAI
 * @param {Object} options - Options object
 * @param {string} options.userInput - The user's query
 * @returns {String} - The generated plan with steps to execute
 */
async function getPlan(options) {
  // Default options
  const {
    userInput,
  } = options;

  const currentDirectory = getCurrentDirectory();

  try {
    
    // Create messages array for the API call
    const messages = [
      // System message with planning instructions
      {
        role: "system",
        content: `You are a helpful assistant tasked with creating execution plans.

        Operating system info:
        ${process.platform} (${process.arch})

        Node.js version: ${process.version}

        Current working directory: ${currentDirectory}
        
        Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => 
          `${name}: ${schema.description}`
        ).join('\n')}
        
        IMPORTANT:

        1. Respond with a short goal statement summarizing what you aim to accomplish.
        2. YOUR ACTIONS CAN ONLY BE COMPLETED USING the Available tools AND NOTHING ELSE.
        3. DO NOT SHOW A LIST OF ACTIONS OR STEPS.
        4. DO NOT PROVIDE ADDITIONAL INFORMATION OR EXPLANATIONS.
        5. EXPLORE WORKING DIRECTORY IF NECESSARY TO UNDERSTAND THE CODEBASE AND THEN TAKE FURTHER ACTIONS.
        
        FORMAT EXAMPLE:
        
        Goal: The user wants me to create a logger using chalk with similar logic to the existing showInfo functionality. They also want me to update the files src/index.js and src/utils/tools.js to avoid DEBUG conditions and encapsulate logging functionality in the logger. First, I need to examine the current files to understand their structure and how showInfo is implemented.

        `
      },
      {
        role: "user",
        content: `Create an execution plan for the following query: ${userInput}`
      }
    ];

    // Call the OpenAI API to generate a plan
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_completion_tokens: 200,
    });

    const messageContent = response.choices[0]?.message?.content;

    
    if (Boolean(messageContent)) {
        // Save the generated plan to context
        setPlan(messageContent);
      
        return messageContent
    } else {
      logger.log(" No valid plan generated.");
      return  null
    }
  } catch (error) {
    logger.error(" OpenAI Plan Generation Error:", error.message);
    return null
  }
}

module.exports = getPlan;
