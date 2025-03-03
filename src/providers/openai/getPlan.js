const { OpenAI } = require("openai");
const { setPlan, getCurrentDirectory } = require("../../utils/context");
const { tools } = require("../../utils/tools");

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

  try {
    
    // Create messages array for the API call
    const messages = [
      // System message with planning instructions
      {
        role: "system",
        content: `You are an AI code analyzer that creates execution plans. 
        Create a sequential plan to answer the user's query using the available tools.
        
        Current working directory: ${getCurrentDirectory()}
        
        Available tools and their schemas:
        ${Object.entries(tools).map(([name, tool]) => {
          return `Tool: ${name}
Schema: ${JSON.stringify(tool.schema, null, 2)}`;
        }).join('\n\n')}`
      },
      // Add user query
      {
        role: "user",
        content: userInput
      }
    ];

    // Call the OpenAI API to generate a plan
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 200,
    });

    const messageContent = response.choices[0]?.message?.content;

    
    if (Boolean(messageContent)) {
        // Save the generated plan to context
        const planObject = { content: messageContent };
        setPlan(planObject);
      
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
