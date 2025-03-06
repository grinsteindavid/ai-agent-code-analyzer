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
        5. If you have already achieved the execution plan goal, return "STOP EXECUTION"
        6. Be as short and brief as possible and do not include any additional text
        7. Beware of the Current directory for paths and Operating system info.
        8. Do not use a list just a description of how you are going to take action.
        9. MAX TOKENS: 60.

        YOU MUST EXPLICITLY INCLUDE THE TOOL NAME IN YOUR RESPONSE. Format: "I will [action description] using the '[tool_name]' tool".

        Examples of correctly formatted responses:
        - "I'll list the files in the current directory using the 'list_directories' tool."
        - "I will check the file content using the 'read_file' tool."
        - "I need to search for patterns using the 'grep' tool."

        ` },
      { role: 'user', content: `Execution plan: ${plan}` },
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ],
  });
  
  return response.choices[0]?.message?.content;
}

module.exports = getNextThought;
