const { OpenAI } = require("openai");
const { getMessages, addMessage, getCurrentDirectory, getPlan } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Call OpenAI API and get function call response
 * @param {Object} options - Options object
 * @param {number} [options.maxTokens=4000] - Maximum tokens in the response
 * @param {Array} [options.functions=[]] - Array of function definitions
 * @returns {Object|null} - Function call with name and arguments, or null if error
 */
async function getFunctionCall(options) {
  // Default options
  const {
    maxTokens = 4000,
    functions = [],
  } = options;

  try {
    
    // Get the current plan from context
    const plan = getPlan();
    
    // Create messages array for the API call
    const messages = [
      // System message with instructions
      { role: 'system', content: `
        You are an AI code analyzer. You can only use tools provided. \n
        Current directory: ${getCurrentDirectory()} \n

        IMPORTANT: Follow the execution plan exactly. You MUST:
        1. Check that every function call has been called successfully
        2. If the previous function calls have not been called successfully, retry the last function call 3 times only
        3. If the entire plan have been completed, return function_call as null to end the plan

        Current execution plan:
        ${plan}

       ` 
      },
      // Include conversation history
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: parseInt(maxTokens),
      functions,
    });

    const message = response.choices[0]?.message;
    
    // Return function call if present
    const functionCall = message?.function_call;
    if (functionCall) {
      addMessage('assistant', JSON.stringify(functionCall));

      return {
        name: functionCall.name,
        arguments: JSON.parse(functionCall.arguments),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return null;
  }
}

module.exports = getFunctionCall;
