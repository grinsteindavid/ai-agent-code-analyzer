const { OpenAI } = require("openai");
const { tools } = require("../../utils/tools");
const { getMessages, addMessage, getCurrentDirectory, getPlan } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Call OpenAI API and get function call response
 * @param {Object} options - Options object
 * @param {Array} [options.functions=[]] - Array of function definitions
 * @returns {Object|null} - Function call with name and arguments, or null if error
 */
async function getFunctionCall(options) {
  // Default options
  const {
    functions = [],
  } = options;

  // Get the current plan from context
  const plan = getPlan();
    
  // Create messages array for the API call
  const messages = [
    // System message with instructions
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
     ` 
    },
    {
      role: 'user', content: `Execution plan: ${plan}` },
    // Include conversation history
    ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
  ];

  const nextThought = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: 'system', content: `
        You are a helpful assistant.

      You can ONLY use Availabl tools:
      ${Object.entries(tools).map(([name, {schema}]) => `** ${name}: ${schema.description}`).join('\n')}

        Return only the a next thought of how you are going to proceed based on the plan and previous messages. Be as short as possible.
        ` },
      { role: 'user', content: `Execution plan: ${plan}` },
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ],
  });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools: functions,
    parallel_tool_calls: false,
  });

  addMessage('assistant', JSON.stringify(nextThought.choices[0]?.message?.content));
  addMessage('user', `Continue`);

  const message = response.choices[0]?.message;
  
  // Check for tool_calls first (new OpenAI API format)
  if (message?.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    if (toolCall.type === 'function') {
      const functionCall = toolCall.function;
      addMessage('assistant', JSON.stringify(functionCall));
      console.log(`* ${nextThought.choices[0]?.message?.content}`);

      return {
        name: functionCall.name,
        arguments: JSON.parse(functionCall.arguments),
        nextThought: nextThought.choices[0]?.message?.content
      };
    }
  }
  // Check for direct function_call property (legacy format)
  else if (message?.function_call) {
    const functionCall = message.function_call;
    addMessage('assistant', JSON.stringify(functionCall));
    console.log(`* ${nextThought.choices[0]?.message?.content}`);;

    return {
      name: functionCall.name,
      arguments: JSON.parse(functionCall.arguments),
      nextThought: nextThought.choices[0]?.message?.content
    };
  } 
  // Check if the content field contains function call information as a JSON string
  else if (message?.content && typeof message.content === 'string') {
    try {
      // Try to parse the function content as JSON
      let contentJson
      try {
        contentJson = JSON.parse(message.content);
      } catch (error) {
        return null;
      }
      
      const toolName = contentJson.name;
      const args = typeof contentJson.arguments === 'string' 
      ? JSON.parse(contentJson.arguments) 
      : contentJson.arguments;

      // Check if the parsed content has the expected function call structure
      if (toolName && args) {
        addMessage('assistant', message.content);
        console.log(`* ${nextThought.choices[0]?.message?.content}`);
        
        return {
          name: toolName,
          arguments: args,
          nextThought: nextThought.choices[0]?.message?.content
        };
      }
    } catch (error) {
      addMessage('assistant', `ERROR: ${error.message}`);
      throw error;
    }
    
  }
  
  return null;
}

module.exports = getFunctionCall;
