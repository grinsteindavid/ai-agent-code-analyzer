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
    maxTokens = 120,
  } = options;

  try {
    // Get the plan from context
    const plan = getPlan();
    
    // Create messages array for the API call
    const messages = [
      // System message with instructions
      { 
        role: 'system', 
        content: `You are a helpful assistant.
        
        IMPORTANT:
        1. Review the conversation history and how it aligned with the original execution plan
        2. EXPLAIN WHY each tool was used to accomplish the task
        3. Provide metadata if needed
        3. BE BRIEF AND CONSISE
        4. Keep your summary professional. 
        5. Max ${parseInt(maxTokens)} tokens.

        `
      },
      { role: 'user', content: `Execution plan: ${plan}` },
      // Include conversation history
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_completion_tokens: parseInt(maxTokens),
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
