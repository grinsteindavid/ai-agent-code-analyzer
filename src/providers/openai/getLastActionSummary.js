const { OpenAI } = require("openai");
const { getMessages } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a brief summary of the last action taken
 * @returns {Promise<string>} - A brief description of the last action
 */
async function getLastActionSummary() {
  // Get all messages from the conversation history
  const messages = getMessages();
  
  // If there are no messages, return a default message
  if (messages.length === 0) {
    return null;
  }
  
  // Get the last message from the conversation
  const lastMessage = messages[messages.length - 1];
  
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
          
          Role: ${lastMessage.role}
          Content: ${lastMessage.content}
          
          Describe in a single brief sentence what happened or what was done.
        `
      }
    ],
  });
  
  return response.choices[0]?.message?.content || "Unable to summarize the last action.";
}

module.exports = getLastActionSummary;
