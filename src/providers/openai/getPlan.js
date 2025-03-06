const { OpenAI } = require("openai");
const { setPlan, getCurrentDirectory } = require("../../utils/context");
const { tools } = require("../../utils/tools");
const { listDirectories } = require("../../tools/listDirectories");

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

  // Get file listing for current directory
  const result = await listDirectories(getCurrentDirectory());
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
        
        Files and directories in the current working directory:
        ${result.directories.map(item => `- ${item}`).join('\n')}
        
        Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => 
          `${name}: ${schema.description}`
        ).join('\n')}
        
        IMPORTANT:

        1. Respond with a short goal statement summarizing what you aim to accomplish ONLY USING Available tools AND NOTHING ELSE.
        2. Be as precise as possible to the user's query.
        3. Do not use a list just a description of how you are going to takle the task.
        
        For example:
        
        Goal: The user wants me to move a code snippet from src/index.js to src/utils/tools.js to reduce the code length in the main index file. I need to:
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
      console.log("No valid plan generated.");
      return  null
    }
  } catch (error) {
    console.error("OpenAI Plan Generation Error:", error.message);
    return null
  }
}

module.exports = getPlan;
