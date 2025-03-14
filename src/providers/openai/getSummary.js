const { OpenAI } = require("openai");
const { getMessages, addMessage } = require("../../utils/context");
const { getSummaryPrompt } = require("../system-prompts");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a summary of the execution results or code analysis
 * @param {Object} options - Options object
 * @param {number} [options.maxTokens=400] - Maximum tokens in the response
 * @returns {string} - The generated summary text
 */
async function getSummary(options = {}) {
  // Default options
  const {
    maxTokens = 400,
  } = options;

  try {

    const chatHistory = getMessages().map(msg => ({ role: msg.role, content: msg.content }));
    
    // Get system prompt
    const systemPrompt = getSummaryPrompt(maxTokens);
    
    // Create messages array for the API call
    const messages = [
      // System message with instructions
      { 
        role: 'system', 
        content: systemPrompt
      },
      // Include conversation history
      ...chatHistory
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_completion_tokens: parseInt(maxTokens),
    });

    const summaryContent = response.choices[0]?.message?.content;
    
    if (summaryContent) {
      // Add summary to conversation history
      addMessage('assistant', summaryContent);
      return summaryContent;
    } else {
      return "Could not generate a summary of the analysis.";
    }
  } catch (error) {
    return `Error generating summary: ${error.message}`;
  }
}

module.exports = getSummary;
