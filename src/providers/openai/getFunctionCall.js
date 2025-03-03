const { OpenAI } = require("openai");
const { getMessages, addMessage } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Call OpenAI API and get function call response
 * @param {Object} options - Options object
 * @param {string} options.userInput - The user's query
 * @param {number} [options.maxTokens=4000] - Maximum tokens in the response
 * @param {Array} [options.functions=[]] - Array of function definitions
 * @returns {Object|null} - Function call with name and arguments, or null if error
 */
async function getFunctionCall(options) {
  // Default options
  const {
    userInput,
    maxTokens = 4000,
    functions = [],
  } = options;

  try {
    // Add the user's message to context
    addMessage('user', userInput);
    
    // Create messages array for the API call
    const messages = [
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
      console.log("No valid function call generated.");
      return null;
    }
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return null;
  }
}

module.exports = getFunctionCall;
