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

  try {
    
    // Get the current plan from context
    const plan = getPlan();
    
    // Create messages array for the API call
    const messages = [
      // System message with instructions
      { role: 'system', content: `
        You are an AI code analyzer. \n

        Current directory: ${getCurrentDirectory()} \n

        You can ONLY use Availabl tools:
        ${Object.entries(tools).map(([name, {schema}]) => 
          `${name}`
        ).join('\n')}

        IMPORTANT: Follow the execution plan EXACTLY. You MUST:
        1. Check if all previous function calls already fulfill the plan
        2. If the plan has been fully executed, do NOT return any more function calls
        3. If the plan has been partially executed, only return a function call for the next step in the plan
        4. If no steps of the plan have been executed yet, return a function call for the first step
       ` 
      },
      {
        role: 'user', content: `Execution plan: ${plan}` },
      // Include conversation history
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: functions,
      parallel_tool_calls: false,
    });

    const message = response.choices[0]?.message;
    
    // Check for tool_calls first (new OpenAI API format)
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.type === 'function') {
        const functionCall = toolCall.function;
        addMessage('assistant', JSON.stringify(functionCall));

        return {
          name: functionCall.name,
          arguments: JSON.parse(functionCall.arguments),
        };
      }
    }
    // Check for direct function_call property (legacy format)
    else if (message?.function_call) {
      const functionCall = message.function_call;
      addMessage('assistant', JSON.stringify(functionCall));

      return {
        name: functionCall.name,
        arguments: JSON.parse(functionCall.arguments),
      };
    } 
    // Check if the content field contains function call information as a JSON string
    else if (message?.content && typeof message.content === 'string') {
      try {
        // Try to parse the content as JSON
        const contentJson = JSON.parse(message.content);
        const toolName = contentJson.name;
        const args = typeof contentJson.arguments === 'string' 
        ? JSON.parse(contentJson.arguments) 
        : contentJson.arguments;
        
        // Check if the parsed content has the expected function call structure
        if (toolName && args) {
          addMessage('assistant', message.content);
          
          return {
            name: toolName,
            arguments: args,
          };
        }
      } catch (e) {
        // If parsing fails, it's not a JSON string with function call info
        addMessage('assistant', `${message.content} \n ERROR Failed to parse function call: ${e.message}`);
      }
    }
    
    return null;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return null;
  }
}

module.exports = getFunctionCall;
