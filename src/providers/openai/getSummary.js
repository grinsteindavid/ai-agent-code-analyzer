const { OpenAI } = require("openai");
const { getMessages, addMessage, getPlan } = require("../../utils/context");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a summary of the execution results or code analysis
 * @param {Object} options - Options object
 * @param {number} [options.maxTokens=2000] - Maximum tokens in the response
 * @returns {string} - The generated summary text
 */
async function getSummary(options = {}) {
  // Default options
  const {
    maxTokens = 600,
  } = options;

  try {
    // Get the plan from context
    const plan = getPlan();
    
    // Create messages array for the API call
    const messages = [
      // System message with instructions
      { 
        role: 'system', 
        content: `You are an AI code analyzer assistant.
        
        Original execution plan:
        ${plan}
        
        Your task is to:
        1. Review the conversation history and the original execution plan
        2. Identify the original query that was executed
        3. Summarize the results of the tools that were executed and how they align with the plan
        4. Provide a clear, concise summary of what was found or accomplished
        5. If appropriate, suggest potential next steps or further analysis
        
        Keep your summary professional and focused on the most important findings. Max ${parseInt(maxTokens)} tokens.`
      },
      // Include conversation history
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: parseInt(maxTokens),
    });

    const summaryContent = response.choices[0]?.message?.content;
    
    if (summaryContent) {
      // Add summary to conversation history
      addMessage('assistant', summaryContent);
      return summaryContent;
    } else {
      return "Could not generate a summary of the analysis.";
    }
  } catch (error) {
    return `Error generating summary: ${error.message}`;
  }
}

module.exports = getSummary;
