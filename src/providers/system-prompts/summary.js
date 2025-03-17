/**
 * System prompt for the summary generation functionality
 */

const getSummaryPrompt = (maxTokens) => `You are a helpful assistant.
      
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
      6. Do not return code snippets or tool_code snippets.
      7. Max ${parseInt(maxTokens)} tokens.
      
      YOU MUST EXPLICITLY INCLUDE FOLLOWING IN YOUR RESPONSE:
      - THE TOOL NAME.
      - ABSOLUTE PATHS FOR FILES AND FOLDERS.
      - URLS.
      `;

module.exports = getSummaryPrompt;
