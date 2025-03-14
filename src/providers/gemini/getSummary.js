const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMessages, addMessage, getPlan } = require("../../utils/context");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a summary of the execution results or code analysis using Gemini
 * @param {Object} options - Options object
 * @param {number} [options.maxTokens=400] - Maximum tokens in the response
 * @returns {string} - The generated summary text
 */
async function getSummary(options = {}) {
  // Default options
  const {
    maxTokens = 400,
  } = options;

  try {
    // Get the plan from context
    const plan = getPlan();

    // Format conversation history for Gemini
    const chatHistory = getMessages().map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Create system prompt
    const systemPrompt = `You are a helpful assistant.
      
      Key points to include:
      - Objective & Scope.
      - Key Findings / Insights.
      - Steps Taken / Process Overview.
      - Conclusion & Recommendations.
      - Supporting Data / References (if needed).

      IMPORTANT:
      1. Review the conversation history and how it aligned with the original execution plan. 
      2. EXPLAIN WHY each tool was used to accomplish the goal.
      3. Provide metadata if needed.
      4. Keep your summary professional.
      5. If "show_info" tool was used then DO NOT SUMMARIZE THE SAME DATA, AVOID DUPLICATION.
      6. Max ${parseInt(maxTokens)} tokens.
      
      YOU MUST EXPLICITLY INCLUDE FOLLOWING IN YOUR RESPONSE:
      - THE TOOL NAME.
      - ABSOLUTE PATHS FOR FILES AND FOLDERS.
      - URLS.
      - VARIABLES OR ARGUMENTS FROM USER QUERY.
      `;
    
    // Create the model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    // Prepare the content for generation
    const contents = [
      ...chatHistory,
      { role: 'user', parts: [{ text: `Execution plan: ${plan}` }] }
    ];
    
    // Generate content with the new API pattern
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: parseInt(maxTokens),
      }
    });
    
    const summaryContent = result.response.text();
    
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
