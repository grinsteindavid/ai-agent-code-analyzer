const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMessages } = require("../../utils/context");
const { getNextThoughtPrompt } = require("../system-prompts");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate the next thought based on the execution plan and conversation history
 * @returns {Object} - Object containing the next thought from the AI
 */
async function getNextThought() {
  const maxTokens = 200;
  
  try {
    // Prepare system instruction
    const systemInstruction = getNextThoughtPrompt(maxTokens);
      
    // Create the model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    // Format conversation history for Gemini
    const chatHistory = getMessages().map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Prepare the content for generation
    const contents = [
      ...chatHistory,
      { role: 'user', parts: [{ text: "What is the next step I should take?" }] }
    ];
    
    // Generate content with the new API pattern
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: maxTokens,
      }
    });
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini Next Thought Error:", error);
    return "Error generating next thought: " + error.message;
  }
}

module.exports = getNextThought;
