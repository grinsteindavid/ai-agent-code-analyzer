const { OpenAI } = require("openai");
const { getMessages, addMessage } = require("../../utils/context");
const logger = require("../../utils/logger");
const { getPlanPrompt } = require("../system-prompts");


// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an execution plan using OpenAI
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

    const chatHistory = getMessages().map(msg => ({ role: msg.role, content: msg.content }));
    
    // Create messages array for the API call
    const messages = [
      // System message with planning instructions
      {
        role: "system",
        content: getPlanPrompt(maxTokens, includePastConversation)
      },
      ...(includePastConversation ? chatHistory : []),
      {
        role: "user",
        content: `Create ${includePastConversation ? "a new" : "an"} execution plan for the following query: ${userInput}`
      },
    ];

    // Call the OpenAI API to generate a plan
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_completion_tokens: maxTokens,
    });

    const messageContent = response.choices[0]?.message?.content;

    
    if (Boolean(messageContent)) {
        // Save the generated plan to context
        addMessage('user', messageContent);
      
        return messageContent
    } else {
      logger.log(" No valid plan generated.");
      return  null
    }
  } catch (error) {
    logger.error(" OpenAI Plan Generation Error:", error.message);
    return null
  }
}

module.exports = getPlan;
