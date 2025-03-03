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

        IMPORTANT: Follow the execution plan EXACTLY. You MUST:
        1. Check if all previous function calls already fulfill the plan
        2. If the plan has been fully executed, do NOT return any more function calls
        3. If the plan has been partially executed, only return a function call for the next step in the plan
        4. If no steps of the plan have been executed yet, return a function call for the first step
       ` 
      },
      {
        role: 'user', content: `Execution plan: ${plan}` },
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
