const { Configuration, OpenAIApi } = require('openai');

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Get grep patterns from GPT-4 based on the query and available context
 * @param {string} query - User query about the codebase
 * @param {string} directory - Directory being analyzed
 * @param {string} extensions - File extensions to analyze
 * @param {string} ignore - Patterns to ignore
 * @returns {string[]} Array of grep patterns 
 */
async function getGrepPatterns(query, directory, extensions, ignore) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`Attempt ${attempts} to generate grep patterns...`);
      
      const grepPatternsResponse = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert code analyst specializing in generating grep search patterns to find relevant code. 

You will be given a question about a codebase, and your task is to generate 5-10 grep-compatible search patterns that would effectively find code related to the question.

VERY IMPORTANT FORMATTING INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON array of strings
2. Each string should be a grep pattern
3. Do not include any explanation, just the JSON array
4. Example of correct format: ["pattern1", "pattern2", "pattern3"]
5. DO NOT use escape characters in your JSON that would make it invalid

Pattern generation guidelines:
1. For JavaScript/Node.js codebases, focus on simple patterns like:
   - "function" - to find function declarations
   - "module.exports" - to find module exports
   - "require(" - to find dependencies
   - "const" - to find constant declarations
   - "describe" or "it(" - for test files
   - "/\*" - to find comment blocks that may contain documentation
2. Avoid complex regex patterns with special characters
3. Include both generic and specific patterns
4. Use simple words likely to be found in code or comments
5. When analyzing architecture, include terms like "config", "setup", "init", "server", "router"

Examples:

Question: "Explain the project architecture"
Response: ["function", "module.exports", "require(", "const", "server", "router", "app", "index", "config", "setup", "init"]

Question: "How does error handling work?"
Response: ["try", "catch", "throw", "error", "exception", "handle", "log.error", "console.error"]

Now, generate appropriate grep patterns for the given question.`
          },
          {
            role: 'user',
            content: `I'm analyzing a JavaScript/Node.js codebase and want to find code related to this question: "${query}"

Analysis context:
- Directory being analyzed: ${directory}
- File extensions being analyzed: ${extensions}
- Patterns being ignored: ${ignore}

I need simple, effective grep patterns that will help me understand the overall structure and architecture of the codebase. Include common JavaScript/Node.js constructs and avoid complex regex patterns.`
          }
        ],
      });

      const content = grepPatternsResponse.data.choices[0].message.content.trim();
      console.log(`DEBUG grepPatternsResponse: ${content}`);
      
      // More robust parsing for various response formats
      let jsonStr;
      // Try to extract from code blocks first
      const jsonMatch = content.match(/```(?:json)?\n([\s\S]*)\n```/);
      jsonStr = jsonMatch ? jsonMatch[1].trim() : content;
      
      // Clean up potential issues with the JSON string
      // If it's not already wrapped in square brackets, do so
      if (!jsonStr.startsWith('[') && !jsonStr.endsWith(']')) {
        // Check if it might be wrapped in other characters
        if (jsonStr.includes('[') && jsonStr.includes(']')) {
          const start = jsonStr.indexOf('[');
          const end = jsonStr.lastIndexOf(']') + 1;
          jsonStr = jsonStr.substring(start, end);
        } else {
          // It might be a comma-separated list, so wrap it
          jsonStr = `[${jsonStr}]`;
        }
      }
      
      // Fix common JSON parsing issues with escape characters
      // Replace improperly escaped characters with properly escaped ones
      jsonStr = jsonStr.replace(/"\\?\./g, '"\\.')      // Fix \. and .
                         .replace(/\\\\\./g, '\\\\.')   // Don't double-escape already correct ones
                         .replace(/\\$/g, '\\\\$')       // Fix $ escape
                         .replace(/\\\(/g, '\\\\(')     // Fix ( escape
                         .replace(/\\\)/g, '\\\\)')     // Fix ) escape
      
      console.log(`Attempting to parse: ${jsonStr}`);
      
      // Attempt to parse the JSON response
      let patterns;
      try {
        patterns = JSON.parse(jsonStr);
      } catch (e) {
        // Last resort - try to manually parse it
        console.log(`JSON parse failed: ${e.message}. Trying fallback parser...`);
        
        // Simple regex-based parser for arrays of strings
        const matches = jsonStr.match(/"([^"]*)"/g);
        if (matches && matches.length > 0) {
          patterns = matches.map(m => m.slice(1, -1));
          console.log(`Fallback parser found ${patterns.length} patterns`);
        } else {
          throw e; // Re-throw if our fallback fails
        }
      }
      
      // Validate that we got an array of strings
      if (Array.isArray(patterns) && patterns.length > 0 && patterns.every(p => typeof p === 'string')) {
        console.log(`Successfully generated ${patterns.length} grep patterns on attempt ${attempts}`);
        return patterns;
      } else {
        throw new Error('Response is not a valid array of strings');
      }
    } catch (e) {
      console.error(`Attempt ${attempts} failed: ${e.message}`);
      if (attempts >= maxAttempts) {
        console.error('Maximum attempts reached. Using default patterns.');
        return ['function', 'class', 'import', 'export'];
      }
      // Small delay before trying again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Fallback if loop exits unexpectedly
  return ['function', 'class', 'import', 'export'];
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
async function analyzeCode(query, codeChunks, grepResults, grepPatterns, maxTokens = 2000) {
  console.log(`DEBUG analyzeCode: Analyzing ${codeChunks.length} code chunks`);
  
  // Determine if we're doing direct file analysis vs. grep-based analysis
  const isDirectAnalysis = !grepResults || Object.keys(grepResults).length === 0;
  console.log(`DEBUG analyzeCode: Using ${isDirectAnalysis ? 'direct file' : 'grep-based'} analysis`);
  
  // Prepare the context message with code chunks
  let contextMessage = `I'm analyzing a codebase to answer: "${query}"\n\n`;
  contextMessage += `Here are relevant code samples:\n\n`;
  
  let chunkNum = 1;
  const maxContentLength = 15000; // Conservative limit to avoid token issues
  let currentLength = 0;
  
  for (const chunk of codeChunks) {
    // Add file info header
    const ext = require('path').extname(chunk.file).slice(1) || 'js';
    const fileHeader = `### CHUNK ${chunkNum}: ${chunk.file} (Lines ${chunk.lineStart || 'N/A'}-${chunk.lineEnd || 'N/A'})\n`;
    const codeBlock = "```" + ext + "\n" + chunk.content + "\n" + "```\n\n";
    
    // Check if adding this chunk would exceed our limit
    if (currentLength + fileHeader.length + codeBlock.length > maxContentLength) {
      console.log(`DEBUG analyzeCode: Reached content limit after ${chunkNum-1} files`);
      contextMessage += `\nNote: Additional ${codeChunks.length - (chunkNum-1)} code chunks exist but were omitted due to token limits.`;
      break;
    }
    
    contextMessage += fileHeader + codeBlock;
    currentLength += fileHeader.length + codeBlock.length;
    chunkNum++;
  }
  
  // Only add grep results if we have them and are using grep-based analysis
  if (!isDirectAnalysis && grepPatterns && grepPatterns.length > 0) {
    contextMessage += "\n### GREP SEARCH RESULTS:\n";
    for (const pattern of grepPatterns) {
      contextMessage += `\nMatches for pattern "${pattern}":\n`;
      let matchCount = 0;
      
      for (const file of Object.keys(grepResults)) {
        if (grepResults[file] && grepResults[file][pattern]) {
          matchCount++;
          if (matchCount <= 5) { // Limit to 5 files per pattern to save tokens
            contextMessage += `- ${file}:\n`;
            // Truncate if too many matches
            const matches = grepResults[file][pattern].split('\n');
            const displayMatches = matches.slice(0, 5);
            displayMatches.forEach(match => {
              contextMessage += `  ${match}\n`;
            });
            if (matches.length > 5) {
              contextMessage += `  ... and ${matches.length - 5} more matches\n`;
            }
          }
        }
      }
      
      if (matchCount > 5) {
        contextMessage += `... and ${matchCount - 5} more files with matches for this pattern\n`;
      }
      if (matchCount === 0) {
        contextMessage += "No matches found\n";
      }
    }
  }
  
  // Create different system messages based on analysis type
  let systemContent = '';
  
  if (isDirectAnalysis) {
    systemContent = `You are an expert code analyst specializing in Node.js and JavaScript codebases.

You're analyzing complete files from a codebase to understand its architecture and structure.

When analyzing the provided code:

1. START WITH A CLEAR ANSWER that provides an overview of the codebase architecture
2. DESCRIBE THE MAIN COMPONENTS and their responsibilities
3. EXPLAIN HOW COMPONENTS INTERACT with each other (data flow, function calls, etc.)
4. IDENTIFY DESIGN PATTERNS and architectural choices present in the code
5. CITE SPECIFIC EVIDENCE from the files to support your analysis

Structure your response with these sections:

## Codebase Architecture Overview
[High-level summary of the codebase architecture and main components]

## Component Breakdown
[Description of each major component, its purpose and functionality]

## Component Interactions
[How the different parts of the codebase work together]

## Design Patterns & Implementation Details
[Notable patterns, coding styles, and specific implementation details]

## Strengths & Potential Improvements
[Assessment of the architecture's strengths and areas for improvement]`;
  } else {
    systemContent = `You are an expert code analyst tasked with providing detailed, accurate answers about codebases based on code samples and grep search results.

When analyzing the provided code:

1. START WITH A CLEAR ANSWER to the user's question based on the evidence in the code samples
2. CITE SPECIFIC EVIDENCE including file names and line numbers (e.g., "In auth.js lines 15-20...")
3. INCLUDE RELEVANT CODE SNIPPETS to support your explanations (use markdown code blocks)
4. ORGANIZE YOUR RESPONSE with clear sections and headers for different aspects of the answer
5. BE TECHNICALLY PRECISE - use the correct terminology for the programming language and frameworks
6. If the code samples are insufficient to fully answer the question, EXPLICITLY STATE what's missing

Example structure:

## Answer
[Direct answer to the question with a high-level overview]

## Key Components
[Breakdown of the main components/functions/classes involved]

## Code Flow
[Explanation of how the code works, with specific file references]

## Code Examples
[Important code snippets with explanations]

## Additional Notes
[Any limitations, potential issues, or suggestions]`;
  }

  console.log(`DEBUG analyzeCode: Using prompt optimized for ${isDirectAnalysis ? 'architecture analysis' : 'specific query'}`);

  try {
    // Get analysis from GPT-4
    const analysisResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: contextMessage + `\n\nBased on the provided code${isDirectAnalysis ? ' files' : ' samples and search results'}, ${isDirectAnalysis ? 'explain the architecture and organization of this codebase' : 'please answer my question'}. Query: "${query}"`
        }
      ],
      max_tokens: parseInt(maxTokens, 1000),
      temperature: 0.5
    });
  
    return analysisResponse.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing code with OpenAI:', error);
    throw new Error(`Error analyzing code: ${error.message}`);
  }
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
