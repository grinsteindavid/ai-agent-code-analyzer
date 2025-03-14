const { OpenAI } = require("openai");
const { setPlan, getMessages, addMessage } = require("../../utils/context");
const { tools } = require("../../utils/tools");
const logger = require("../../utils/logger");
const os = require('os');


// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an execution plan using OpenAI
 * @param {Object} options - Options object
 * @param {string} options.userInput - The user's query
 * @param {boolean} options.includePastConversation - Whether to include the past conversation in the plan
 * @returns {String} - The generated plan with steps to execute
 */
async function getPlan(options) {
  // Default options
  const {
    userInput,
    includePastConversation = false,
  } = options;

  const maxTokens = 200;

  try {
    
    // Create messages array for the API call
    const messages = [
      // System message with planning instructions
      {
        role: "system",
        content: `You are a helpful assistant(AI AGENT) and a senior software engineer that generates an execution plan ${includePastConversation ? "including the past conversation" : ""}.

        ** Operating system info: ${process.platform} (${process.arch}) ${os.release()} ** 
        ** Operating system user home directory (global configurations): ${os.userInfo().homedir} ** 
        ** Operating system username: ${os.userInfo().username} ** 
        ** Operating system shell: ${os.userInfo().shell} ** 
        ** Node.js version: ${process.version} ** 
        ** Current working directory: ${process.cwd()} ** 
        
        -----------------
        Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => 
          `** ${name}: ${schema.description}`
        ).join('** \n')}
        -----------------

        What makes a successful plan:
        - Clear and Specific Goals
        - Thorough Research and Analysis
        - Breaking the plan into manageable steps
        - Proper Resource Allocation
        - Flexibility and Adaptability
        - Setting up checkpoints to review progress allows you to correct course if needed
        
        IMPORTANT:
        1. Be as short as possible.
        2. Your actions can only be completed using the available tools.
        3. Include a list of steps if needed only once. 
        4. Do not include steps that cannot be made with available tools.
        5. Be as technical as possible.
        6. Do not create files for summaries unless specify by the user.
        7. Any math operations cannot be performed by tools.
        8. It is important to include relevant information from user findings and outputs from requested actions using show_info tool.
        9. MAX TOKENS: ${maxTokens}.

        YOU MUST EXPLICITLY INCLUDE FOLLOWING IN YOUR RESPONSE:
        - THE TOOL NAME.
        - ABSOLUTE PATHS FOR FILES AND FOLDERS.
        - URLS.
        - VARIABLES OR ARGUMENTS FROM USER QUERY.
        
        FORMAT EXAMPLE:
        
        - "I need to understand the website at the URL https://jsonplaceholder.typicode.com/todos/. First, I need to retrieve the content of the website to analyze and summarize its features and functionalities."
        - "I need to create a logger using chalk with similar logic to the existing showInfo functionality. I also need to update the files src/index.js and src/utils/tools.js to avoid DEBUG conditions and encapsulate logging functionality in the logger. First, I need to examine the current files to understand their structure and how showInfo is implemented."

        `
      },
      ...(includePastConversation ? getMessages().map(msg => ({ role: msg.role, content: msg.content })) : []),
      {
        role: "user",
        content: `Create ${includePastConversation ? "a new" : "an"} execution plan for the following query: ${userInput}`
      },
    ];

    // Call the OpenAI API to generate a plan
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_completion_tokens: maxTokens,
    });

    const messageContent = response.choices[0]?.message?.content;

    
    if (Boolean(messageContent)) {
        // Save the generated plan to context
        addMessage('user', messageContent);
      
        return messageContent
    } else {
      logger.log(" No valid plan generated.");
      return  null
    }
  } catch (error) {
    logger.error(" OpenAI Plan Generation Error:", error.message);
    return null
  }
}

module.exports = getPlan;
