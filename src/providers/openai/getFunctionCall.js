const { OpenAI } = require("openai");
const os = require('os');
const { tools } = require("../../utils/tools");
const { getMessages, addMessage} = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Call OpenAI API and get function call response
 * @param {Object} options - Options object
 * @param {Array} [options.functions=[]] - Array of function definitions
 * @param {String} [options.nextThought] - The next thought generated by getNextThought
 * @returns {Object|null} - Function call with name and arguments, or null if error
 */
async function getFunctionCall(options) {
  // Default options
  const {
    functions = [],
    nextThought = "",
  } = options;

  if(nextThought.toLowerCase().includes("@stop execution@")) {
    return null;
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      // System message with instructions
      { role: 'system', content: `
        You are a helpful assistant. \n
        
        Operating system info: ${process.platform} (${process.arch}) ${os.release()}
        Operating system user and home directory (global configurations): ${JSON.stringify(os.userInfo())}
        Node.js version: ${process.version}
        Current working directory: ${process.cwd()}
  
        You can ONLY use Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => `** ${name}: ${schema.description}`).join('\n')}
  
        IMPORTANT:
        1. If "Next thought" is equal to "@STOP EXECUTION@" or "@stop execution@" or say something about doing it then STOP and NEVER return a function call
        2. Return ONLY the function call with name and arguments, do not include any additional text
        3. Craft your arguments wisely based on the provided "Next thought" AND ENTIRE CONVERSATION
       ` 
      },
      // Include conversation history
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'assistant', content: `Next thought: ${nextThought}` },
    ],
    tools: functions,
    parallel_tool_calls: false,
  });
  

  const message = response.choices[0]?.message;
  
  // Check for tool_calls first (new OpenAI API format)
  if (message?.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    if (toolCall.type === 'function') {
      const functionCall = toolCall.function;

      return {
        name: functionCall.name,
        arguments: JSON.parse(functionCall.arguments)
      };
    }
  }
  // Check for direct function_call property (legacy format)
  else if (message?.function_call) {
    const functionCall = message.function_call;

    return {
      name: functionCall.name,
      arguments: JSON.parse(functionCall.arguments)
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
        
        return {
          name: toolName,
          arguments: args
        };
      }
    } catch (error) {
      addMessage(`user`, `ERROR: ${JSON.stringify(error)}`);
      throw error;
    }
    
  }
  
  return null;
}

module.exports = getFunctionCall;
