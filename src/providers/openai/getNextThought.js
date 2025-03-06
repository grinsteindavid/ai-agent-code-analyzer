const { OpenAI } = require("openai");
const { tools } = require("../../utils/tools");
const { getMessages, getCurrentDirectory, getPlan } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate the next thought based on the execution plan and conversation history
 * @returns {Object} - Object containing the next thought from the AI
 */
async function getNextThought() {
  // Get the current plan from context
  const plan = getPlan();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 60,
    messages: [
      { role: 'system', content: `
        You are a helpful assistant. \n
  
        Always include the Current directory for paths: ${getCurrentDirectory()} \n
  
        You can ONLY use Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => `** ${name}: ${schema.description}`).join('\n')}
  
        IMPORTANT:
        
        1. You can ONLY use Available tools.
        2. DO NOT CREATE OR UPDATE FILES IF NOT EXPLICITLY REQUESTED OR IF NOT EXPLICITLY IN THE EXECUTION PLAN GOAL
        3. Always check project structure before taking action.
        4. Return ONLY the next thought of how are you going to proceed to achieve the execution plan goal based on previous messages.
        5. If you have already achieved the execution plan goal, return "EXECUTION PLAN GOAL ACHIEVED"
        6. Be as short and brief as possible and do not include any additional text
        7. Beware of the Current directory for paths and Operating system info.
        8. Do not use a list just a description of how you are going to take action.
        9. YOU CAN ONLY RETURN THE ACTION YOU WILL PERFORM ALONG THE TOOL NAME.
        10. MAX TOKENS: 60.

        For example:

        I'll list the files and directories in the current directory using the 'list_directories' tool and then count the number of files.

        ` },
      { role: 'user', content: `Execution plan: ${plan}` },
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ],
  });
  
  return response.choices[0]?.message?.content;
}

module.exports = getNextThought;
