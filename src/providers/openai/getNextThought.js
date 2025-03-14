const { OpenAI } = require("openai");
const { getMessages } = require("../../utils/context");
const { getNextThoughtPrompt } = require("../system-prompts");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate the next thought based on the execution plan and conversation history
 * @returns {Object} - Object containing the next thought from the AI
 */
async function getNextThought() {


  const maxTokens = 200;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: maxTokens,
    messages: [
      { role: 'system', content: getNextThoughtPrompt(maxTokens) },
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content })),
    ],
  });
  
  return response.choices[0]?.message?.content;
}

module.exports = getNextThought;
