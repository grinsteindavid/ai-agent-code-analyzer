const { OpenAI } = require("openai");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Call OpenAI API and get function call response
 * @param {string} userInput - The user's query
 * @param {number} maxTokens - Maximum tokens in the response
 * @param {Array} functions - Array of function definitions
 * @returns {Object|null} - Function call with name and arguments, or null if error
 */
async function getAiFunctionCall(userInput, maxTokens = 4000, functions = []) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userInput }],
      max_tokens: parseInt(maxTokens),
      functions,
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (functionCall) {
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

module.exports = {
  openai,
  getAiFunctionCall
};
