const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMessages, addMessage } = require("../../utils/context");
const logger = require("../../utils/logger");
const { getPlanPrompt } = require("../system-prompts");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate an execution plan using Gemini
 * @param {Object} options - Options object
 * @param {string} options.userInput - The user's query
 * @param {boolean} options.includePastConversation - Whether to include the past conversation in the plan
 * @returns {String} - The generated plan with steps to execute
 */
async function getPlan(options) {
  // Default options
  const {
    userInput,
    includePastConversation = false,
  } = options;

  const maxTokens = 200;

  try {

    // Format conversation history for Gemini
    const chatHistory = includePastConversation ? 
      getMessages().map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      })).filter(msg => msg.role === 'user') : [];

    // Create system prompt with extra context about past conversation if needed
    const systemPrompt = getPlanPrompt(maxTokens, includePastConversation);

    // Create the model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt
    });
    
    // Prepare the content for the query
    const contents = [
      { role: 'user', parts: [{ text: `Create ${includePastConversation ? "a new" : "an"} execution plan for the following query: ${userInput}` }] }
    ];
    
    // Add conversation history if needed
    if (includePastConversation && chatHistory.length > 0) {
      // Insert chat history before the current query
      contents.unshift(...chatHistory);
    }
    
    // Generate content with the new API pattern
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: maxTokens,
      }
    });
    
    const messageContent = result.response.text();

    if (messageContent) {
      // Save the generated plan to context
      addMessage('user', messageContent);
      return messageContent;
    } else {
      logger.log(" No valid plan generated.");
      return null;
    }
  } catch (error) {
    logger.error(" Gemini Plan Generation Error:", error.message);
    return null;
  }
}

module.exports = getPlan;
