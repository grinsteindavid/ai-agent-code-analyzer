const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMessages, addMessage } = require("../../utils/context");
const { getSummaryPrompt } = require("../system-prompts");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a summary of the execution results or code analysis using Gemini
 * @param {Object} options - Options object
 * @param {number} [options.maxTokens=400] - Maximum tokens in the response
 * @returns {string} - The generated summary text
 */
async function getSummary(options = {}) {
  // Default options
  const {
    maxTokens = 600,
  } = options;

  try {

    // Format conversation history for Gemini
    const chatHistory = getMessages().map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    })).filter(msg => msg.role === 'user');

    // Create system prompt
    const systemPrompt = getSummaryPrompt(maxTokens);
    
    // Create the model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt
    });
    
    // Generate content with the new API pattern
    const result = await model.generateContent({
      contents: chatHistory,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: parseInt(maxTokens),
      }
    });
    
    const summaryContent = result.response.text();
    
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
