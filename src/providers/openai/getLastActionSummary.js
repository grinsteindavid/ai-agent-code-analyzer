const { OpenAI } = require("openai");
const { getMessages, getPlan } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a brief summary of the last action taken
 * @param {string} toolResponse - response from a tool that was used
 * @returns {Promise<string>} - A brief description of the last action
 */
async function getLastActionSummary(toolResponse) {
  try {
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
            Include if result was successful or not.


            Execution Plan: ${getPlan()}
          `
        },
        ...getMessages().map(msg => ({ role: msg.role, content: msg.content })),
        { 
          role: 'user', 
          content: `
            Please provide a brief summary of this last action or message:
            
            Tool Response: ${toolResponse}
            
            Describe in a single brief sentence what happened and if align with the original plan and if something is missing.
  
            FORMAT and EXAMPLE:
  
            I've already viewed the necessary files (index.js, tools.js, and showInfo.js) and created a new logger.js file. Now I need to update the other two files to use the new logger
          `
        }
      ],
    });
    
    return response.choices[0]?.message?.content;
  } catch (error) {
    logger.error(` Error getting last action summary: ${error.message}`);
    return `Error getting last action summary: ${error.message}`;
  }
}

module.exports = getLastActionSummary;
