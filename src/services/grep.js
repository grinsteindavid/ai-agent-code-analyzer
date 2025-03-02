const { execSync } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Execute grep searches based on patterns provided by OpenAI
 * @param {string[]} patterns - Array of grep patterns
 * @param {string} directory - Directory to search in
 * @param {string} extensions - Comma-separated list of file extensions
 * @param {string} ignore - Comma-separated list of patterns to ignore
 * @returns {Object} Results from grep searches
 */
async function executeGrepSearches(patterns, directory, extensions, ignore) {
  const results = {};
  const extArray = extensions.split(',');
  const ignoreArray = ignore.split(',');
  
  // Build the grep command from patterns
  for (const pattern of patterns) {
    try {
      // Construct grep command with ignore patterns
      let grepCmd = `grep -r --include="*.{${extensions}}" "${pattern}" ${directory}`;
      
      // Add ignore patterns
      ignoreArray.forEach(ignorePattern => {
        grepCmd += ` --exclude-dir="${ignorePattern}"`;
      });
      
      // Execute the grep command
      const output = execSync(grepCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      
      // Process the results
      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Parse the grep output (format: file:line:content)
        const fileMatch = line.match(/^([^:]+):\d+:(.*)$/);
        if (fileMatch) {
          const [_, file, matchContent] = fileMatch;
          const relativeFile = path.relative(process.cwd(), file);
          
          if (!results[relativeFile]) {
            results[relativeFile] = {};
          }
          
          if (!results[relativeFile][pattern]) {
            results[relativeFile][pattern] = '';
          }
          
          results[relativeFile][pattern] += line + '\n';
        }
      }
    } catch (error) {
      // Grep returns non-zero exit code when no matches found
      if (error.status !== 1) {
        logger.error(`Error executing grep for pattern "${pattern}":`, error);
      }
    }
  }
  
  return results;
}

/**
 * Score and rank files based on grep results
 * @param {Object} grepResults - Results from grep searches
 * @param {string[]} patterns - Array of grep patterns
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} Array of scored and ranked files
 */
function scoreAndRankFiles(grepResults, patterns, maxResults = 5) {
  const fileScores = [];
  
  // Calculate scores for each file
  for (const file in grepResults) {
    let patternMatches = 0;
    let totalMatches = 0;
    
    // Count pattern matches and total matches
    for (const pattern of patterns) {
      if (grepResults[file][pattern]) {
        patternMatches++;
        const matchCount = (grepResults[file][pattern].match(/\n/g) || []).length;
        totalMatches += matchCount;
      }
    }
    
    // Calculate score based on pattern coverage and match count
    const score = (patternMatches / patterns.length) * 0.7 + 
                  (totalMatches / 50) * 0.3; // Cap at 50 matches for scoring
    
    fileScores.push({ file, score, patternMatches, totalMatches });
  }
  
  // Sort files by score and return top results
  return fileScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

module.exports = {
  executeGrepSearches,
  scoreAndRankFiles
};
