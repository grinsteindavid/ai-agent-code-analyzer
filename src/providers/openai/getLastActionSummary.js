const { OpenAI } = require("openai");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a brief summary of the last action taken
 * @param {string} toolResponse - response from a tool that was used
 * @returns {Promise<string>} - A brief description of the last action
 */
async function getLastActionSummary(toolResponse) {


  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: 'system', 
        content: `
          You are a helpful assistant that summarizes actions taken in a coding task.
          Your job is to briefly describe the last action that was taken in the conversation.
          Be concise and focus only on what was done, without any fluff or explanation.
          Keep your summary to a single sentence if possible.
          If the action was to use a specific tool, mention the tool name in your summary.
        `
      },
      { 
        role: 'user', 
        content: `
          Please provide a brief summary of this last action or message:
          
          Tool Response: ${toolResponse}
          
          Describe in a single brief sentence what happened or what was done.
          If applicable, include what the tool returned or found.
        `
      }
    ],
  });
  
  return response.choices[0]?.message?.content;
}

module.exports = getLastActionSummary;
