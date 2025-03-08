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

  const maxTokens = 120;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: maxTokens,
    messages: [
      { role: 'system', content: `
        You are a helpful assistant. \n
  
        Always include the Current directory for paths: ${getCurrentDirectory()} \n
  
        You can ONLY use Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => `** ${name}: ${schema.description}`).join('\n')}

        What makes a successful plan:
        - Clear and Specific Goals
        - Thorough Research and Analysis
        - Breaking the plan into manageable steps
        - Proper Resource Allocation
        - Flexibility and Adaptability
        - Setting up checkpoints to review progress allows you to correct course if needed
  
        IMPORTANT:
        1. You can ONLY use Available tools.
        2. DO NOT CREATE OR UPDATE FILES IF NOT EXPLICITLY REQUESTED OR IF NOT EXPLICITLY IN THE EXECUTION PLAN GOAL
        3. Always check project structure or absolute paths for files and folders before taking actions.
        4. Return ONLY the next thought of how are you going to proceed to achieve the execution plan goal based on previous actions AND WHY you are going to take this action.
        5. If you have already achieved the entire execution plan goal, return "STOP EXECUTION"
        6. Be as short and brief as possible and do not include any additional text
        7. Beware of the Current directory for paths and Operating system info.
        8. DO NOT USE a list just a description of how you are going to take action.
        9. If a tool uses arguments to iterate over content chunks, then iterate as needed to accomplish the execution plan goal.
        10. MAX TOKENS: ${maxTokens}.

        YOU MUST EXPLICITLY INCLUDE THE TOOL NAME IN YOUR RESPONSE AND ABSOLUTE PATHS FOR FILES AND FOLDERS.

        Examples of correctly formatted responses:
        - "I'll proceed by searching for specific keywords related to market trends in the text files, specifically "Market_Search_Results.txt", "Stock_Market_News_Summary.txt", and "US_Stock_Market_News.md". This is necessary to compile the relevant information for the summary report later. I'll use the "grep_search" tool for this purpose."
        - "I'll compile the matches found from the "Market_Search_Results.txt", "Stock_Market_News_Summary.txt", and "US_Stock_Market_News.md" files into a summary format. This step is crucial to create a report that encapsulates the relevant information gathered from the previous search. Once compiled, I'll use the "create_file" tool to save this summary report to a new text file."
        - "I'll now update the content of the newly created "Market_Trends_Summary_Report.txt" with the compiled matches regarding market trends to complete the summary report. This is the final step to ensure the report reflects the gathered information accurately. I'll use the "update_file" tool for this action."
        ` },
      { role: 'user', content: `Execution plan: ${plan}` },
      ...getMessages().map(msg => ({ role: msg.role, content: msg.content }))
    ],
  });
  
  return response.choices[0]?.message?.content;
}

module.exports = getNextThought;
