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
  
        You can ONLY use Availabl tools:
        ${Object.entries(tools).map(([name, {schema}]) => `** ${name}: ${schema.description}`).join('\n')}
  
        IMPORTANT: Follow the execution plan EXACTLY. You MUST:
        1. Check if all previous function calls already fulfill the plan
        2. If the plan has been fully executed, do NOT return any more function calls
        3. If the plan has been partially executed, only return a function call for the next step in the plan
        4. If no steps of the plan have been executed yet, return a function call for the first step
        5. avoid repeating steps with same arguments

        Return ONLY the next thought of how you are going to proceed based on the plan and previous messages, be as short as possible and do not include any additional text.

        For example:

        I'll proceed with the first step of the execution plan and create a new file named 'file4.csv' in the root project folder.

        ` },
      { role: 'user', content: `Execution plan: ${plan}` },
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ],
  });
  
  return response.choices[0]?.message?.content;
}

module.exports = getNextThought;
