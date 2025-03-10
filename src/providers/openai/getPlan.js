const { OpenAI } = require("openai");
const { setPlan, getCurrentDirectory } = require("../../utils/context");
const { tools } = require("../../utils/tools");
const logger = require("../../utils/logger");
const os = require('os');


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
  const maxTokens = 200;

  try {
    
    // Create messages array for the API call
    const messages = [
      // System message with planning instructions
      {
        role: "system",
        content: `You are a helpful bot assistant that generates an execution plan based on the user's query and will be executed in the terminal.

        Operating system info: ${process.platform} (${process.arch}) ${os.release()}
        Operating system user: ${JSON.stringify(os.userInfo())}
        Node.js version: ${process.version}
        Current working directory: ${currentDirectory}
        
        -----------------
        Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => 
          `${name}: ${schema.description}`
        ).join('\n')}
        -----------------

        What makes a successful plan:
        - Clear and Specific Goals
        - Thorough Research and Analysis
        - Breaking the plan into manageable steps
        - Proper Resource Allocation
        - Flexibility and Adaptability
        - Setting up checkpoints to review progress allows you to correct course if needed
        
        IMPORTANT:
        1. YOUR ACTIONS CAN ONLY BE COMPLETED USING the Available tools
        2. ALWAYS INCLUDE VARIABLES OR ARGUMENTS OR URLS FROM USER QUERY IN THE GOAL SO IT CAN BE USE FOR FURTHER ACTIONS.
        3. Create a plan that can be executed by a you (a bot running in the computer).
        4. Include a list of steps if needed. 
        5. MAX TOKENS: ${maxTokens}.
        
        FORMAT EXAMPLE:
        
        - "The user wants me to explain the website at the URL https://jsonplaceholder.typicode.com/todos/. First, I need to retrieve the content of the website to analyze and summarize its features and functionalities."
        - "The user wants me to create a logger using chalk with similar logic to the existing showInfo functionality. They also want me to update the files src/index.js and src/utils/tools.js to avoid DEBUG conditions and encapsulate logging functionality in the logger. First, I need to examine the current files to understand their structure and how showInfo is implemented."

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
      max_completion_tokens: maxTokens,
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
