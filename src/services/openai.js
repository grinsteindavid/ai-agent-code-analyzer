const { Configuration, OpenAIApi } = require('openai');

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Get grep patterns from GPT-4 based on the query
 * @param {string} query - User query about the codebase
 * @returns {string[]} Array of grep patterns 
 */
async function getGrepPatterns(query) {
  try {
    const grepPatternsResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code analyst that helps generate grep search patterns to find relevant code. Only respond with a JSON array of strings, each string being a different grep pattern that would help find code related to the question. Suggest 2-5 different patterns.'
        },
        {
          role: 'user',
          content: `I'm analyzing a codebase and want to find code related to this question: "${query}"`
        }
      ],
    });

    const content = grepPatternsResponse.data.choices[0].message.content.trim();
    // Handle both direct JSON and code block JSON
    const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || content.match(/```\n([\s\S]*)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error parsing grep patterns from GPT-4 response. Using default patterns.');
    return ['function', 'class', 'import', 'export'];
  }
}

/**
 * Analyze code chunks with GPT-4
 * @param {string} query - User query about the codebase
 * @param {Array} codeChunks - Array of code chunks to analyze
 * @param {Object} grepResults - Results from grep search
 * @param {string[]} grepPatterns - Patterns used for grep search
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {string} GPT-4 analysis 
 */
async function analyzeCode(query, codeChunks, grepResults, grepPatterns, maxTokens) {
  // Prepare the context message with code chunks
  let contextMessage = `I'm analyzing a codebase to answer: "${query}"\n\n`;
  contextMessage += `Here are relevant code samples:\n\n`;
  
  let chunkNum = 1;
  for (const chunk of codeChunks) {
    // Add file info header
    const ext = require('path').extname(chunk.file).slice(1);
    contextMessage += `### CHUNK ${chunkNum}: ${chunk.file} (Lines ${chunk.startLine}-${chunk.endLine})\n`;
    contextMessage += "```" + ext + "\n";
    contextMessage += chunk.content + "\n";
    contextMessage += "```\n\n";
    chunkNum++;
    
    // Check if we need to make multiple API calls due to token limits
    if (contextMessage.length > 12000 && chunkNum < codeChunks.length) {
      contextMessage += `\nNote: Additional code chunks exist but were omitted due to token limits.`;
      break;
    }
  }
  
  // Add grep results summary
  contextMessage += "\n### GREP SEARCH RESULTS:\n";
  for (const pattern of grepPatterns) {
    contextMessage += `\nMatches for pattern "${pattern}":\n`;
    let matchCount = 0;
    
    for (const file of Object.keys(grepResults)) {
      if (grepResults[file][pattern]) {
        matchCount++;
        if (matchCount <= 10) { // Limit to 10 files per pattern to save tokens
          contextMessage += `- ${file}:\n`;
          // Truncate if too many matches
          const matches = grepResults[file][pattern].split('\n');
          const displayMatches = matches.slice(0, 10);
          displayMatches.forEach(match => {
            contextMessage += `  ${match}\n`;
          });
          if (matches.length > 10) {
            contextMessage += `  ... and ${matches.length - 10} more matches\n`;
          }
        }
      }
    }
    
    if (matchCount > 10) {
      contextMessage += `... and ${matchCount - 10} more files with matches for this pattern\n`;
    }
    if (matchCount === 0) {
      contextMessage += "No matches found\n";
    }
  }

  // Get analysis from GPT-4
  const analysisResponse = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert code analyst that provides detailed answers about codebases.
        
        Guidelines for your response:
        1. Answer the user's question comprehensively based on the provided code samples
        2. Give specific file names and line numbers when referencing code
        3. Provide code snippets for important parts of your explanation
        4. Be concise but thorough
        5. If the provided code isn't sufficient to fully answer the question, mention what additional information would be needed
        6. Organize your response with clear sections and formatting`
      },
      {
        role: 'user',
        content: contextMessage
      }
    ],
    max_tokens: parseInt(maxTokens, 10)
  });

  return analysisResponse.data.choices[0].message.content;
}

// Check if OpenAI API key is set
function validateApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY not found in environment variables. Please create a .env file with your API key.');
    process.exit(1);
  }
}

module.exports = {
  validateApiKey,
  getGrepPatterns,
  analyzeCode
};
