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
  const ignoreArray = ignore.split(',');
  let totalMatchesFound = 0;
  
  // Print directory and debug info
  console.log(`DEBUG: Searching in directory: ${directory}`);
  console.log(`DEBUG: Looking for extensions: ${extensions}`);
  console.log(`DEBUG: Ignoring patterns: ${ignore}`);
  
  // Build the grep command from patterns
  for (const pattern of patterns) {
    try {
      // Ensure pattern is properly escaped for shell
      const escapedPattern = pattern.replace(/[()\[\]{}*+?^$|]/g, '\\$&');
      
      // Construct grep command with ignore patterns
      let grepCmd = `grep -r --include="*.{${extensions}}" -F "${escapedPattern}" ${directory}`;
      
      // Add ignore patterns
      ignoreArray.forEach(ignorePattern => {
        grepCmd += ` --exclude-dir="${ignorePattern}"`;
      });
      
      console.log(`DEBUG: Executing grep command: ${grepCmd}`);
      
      // Execute the grep command
      const output = execSync(grepCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const lines = output.trim().split('\n');
      let matchCount = 0;
      
      // Process the results
      for (const line of lines) {
        if (!line.trim()) continue;
        matchCount++;
        totalMatchesFound++;
        
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
        } else {
          console.log(`DEBUG: Line did not match expected format: ${line}`);
        }
      }
      
      console.log(`DEBUG: Found ${matchCount} matches for pattern "${pattern}"`);
      
    } catch (error) {
      // Grep returns non-zero exit code when no matches found
      if (error.status !== 1) {
        logger.error(`Error executing grep for pattern "${pattern}":`, error);
      } else {
        console.log(`DEBUG: No matches found for pattern "${pattern}"`);
      }
    }
  }
  
  // Log the files found and total matches
  console.log(`DEBUG: Total grep matches found: ${totalMatchesFound}`);
  console.log(`DEBUG: Files with matches: ${Object.keys(results).length}`);
  if (Object.keys(results).length > 0) {
    console.log(`DEBUG: Files with matches:`);
    Object.keys(results).forEach(file => {
      const patternCount = Object.keys(results[file]).length;
      console.log(`DEBUG:   - ${file} (${patternCount} patterns matched)`);
    });
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
  
  console.log(`DEBUG: Scoring ${Object.keys(grepResults).length} files`);
  
  // Calculate scores for each file
  for (const file in grepResults) {
    let patternMatches = 0;
    let totalMatches = 0;
    
    // Count pattern matches and total matches
    for (const pattern of patterns) {
      if (grepResults[file] && grepResults[file][pattern]) {
        patternMatches++;
        const matchCount = (grepResults[file][pattern].match(/\n/g) || []).length;
        totalMatches += matchCount;
      }
    }
    
    console.log(`DEBUG: File ${file} has ${patternMatches} pattern matches and ${totalMatches} total matches`);
    
    // Always include files that have any matches at all
    const score = patternMatches > 0 || totalMatches > 0 ? 0.5 : 0.01;
    
    // Push all files that have any content
    if (Object.keys(grepResults[file] || {}).length > 0) {
      fileScores.push({ file, score, patternMatches, totalMatches });
    }
  }
  
  // If there are still no files scored, try to include ALL files we found
  if (fileScores.length === 0) {
    console.log('DEBUG: No files had any matches, including all files seen by grep');
    
    // Look for any JS files in the source directory using find
    try {
      const { execSync } = require('child_process');
      const jsFiles = execSync(`find src -name "*.js"`, { encoding: 'utf-8' })
        .trim().split('\n');
      
      console.log(`DEBUG: Found ${jsFiles.length} JS files using find`);  
      
      // Add all JS files with a minimal score
      for (const file of jsFiles) {
        if (file.trim()) {
          fileScores.push({ 
            file, 
            score: 0.01, 
            patternMatches: 0, 
            totalMatches: 0,
            message: 'No pattern matches found, included for analysis'
          });
        }
      }
    } catch (error) {
      console.log(`DEBUG: Error finding JS files: ${error.message}`);
    }
  }
  
  console.log(`DEBUG: Final file scores: ${fileScores.length} files`);
  
  // Return all files if we have 5 or fewer
  if (fileScores.length <= maxResults) {
    return fileScores;
  }
  
  // Otherwise sort and return top results
  return fileScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

module.exports = {
  executeGrepSearches,
  scoreAndRankFiles
};
