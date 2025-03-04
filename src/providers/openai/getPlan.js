const { OpenAI } = require("openai");
const { setPlan, getCurrentDirectory } = require("../../utils/context");
const { tools } = require("../../utils/tools");
const { executeLs } = require("../../tools/executeLs");

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
  const result = await executeLs(getCurrentDirectory());
  const currentDirectory = getCurrentDirectory();

  try {
    
    // Create messages array for the API call
    const messages = [
      // System message with planning instructions
      {
        role: "system",
        content: `You are an AI code analyzer tasked with creating execution plans.

        Current working directory: ${currentDirectory}
        
        Files and directories in ${currentDirectory}:
        ${result.directories.map(item => `- ${item}`).join('\n')}
        
        Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => 
          `${name}: ${schema.description || 'No description provided.'}`
        ).join('\n')}

        Respond with a short goal statement summarizing what you aim to accomplish, followed by a numbered list of steps, each using a specific tool. For example:
        Goal: Find all JavaScript files that import specific packages.
        
        1. Use the 'ls' tool to list contents of directory X.
        2. Use the 'readFile' tool to read file Y.
        
        Do not include any explanations or additional text outside of the goal and numbered steps. Max 300 tokens.`
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
      max_tokens: 300,
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
