const { exec } = require('child_process');

/**
 * Find files containing a pattern
 * @param {string} pattern - The grep pattern to search for
 * @param {string} directory - The directory to search in
 * @param {string[]} extensions - Array of file extensions to search
 * @returns {Promise<string[]>} Array of file paths containing the pattern
 */
function findFilesWithPattern(pattern, directory, extensions) {
  return new Promise((resolve) => {
    const fileExtensionPattern = extensions.map(ext => `*.${ext}`).join(' -o -name ');
    const cmd = `find ${directory} -type f \\( -name ${fileExtensionPattern} \\) -not -path "*/node_modules/*" -not -path "*/\\.*" | xargs grep -l "${pattern}" 2>/dev/null`;
    
    exec(cmd, (error, stdout) => {
      if (error) {
        // Grep returns error code 1 if no matches, which is not a real error for us
        resolve([]);
        return;
      }
      
      const files = stdout.trim().split('\n').filter(Boolean);
      resolve(files);
    });
  });
}

/**
 * Get grep match content for a file and pattern
 * @param {string} file - The file to search in
 * @param {string} pattern - The grep pattern to search for
 * @returns {Promise<string>} The grep output showing matches
 */
function getPatternMatchesInFile(file, pattern) {
  return new Promise((resolve) => {
    const cmd = `grep -n "${pattern}" "${file}" 2>/dev/null`;
    
    exec(cmd, (error, stdout) => {
      if (error) {
        resolve('');
        return;
      }
      
      resolve(stdout.trim());
    });
  });
}

/**
 * Execute grep searches for all patterns and build results object
 * @param {string[]} patterns - Array of grep patterns
 * @param {string} directory - Directory to search in
 * @param {string[]} extensions - Array of file extensions to search
 * @returns {Promise<Object>} Object with grep results
 */
async function executeGrepSearches(patterns, directory, extensions) {
  const grepResults = {};
  
  console.log('\nSearching for patterns in files...');
  for (const pattern of patterns) {
    const files = await findFilesWithPattern(pattern, directory, extensions);
    console.log(`Pattern "${pattern}" found in ${files.length} files`);
    
    for (const file of files) {
      if (!grepResults[file]) {
        grepResults[file] = {};
      }
      
      const content = await getPatternMatchesInFile(file, pattern);
      if (content) {
        grepResults[file][pattern] = content;
      }
    }
  }
  
  return grepResults;
}

/**
 * Score files based on grep results to identify most relevant files
 * @param {Object} grepResults - Object with grep results
 * @param {number} limit - Maximum number of files to return
 * @returns {Array} Array of scored files
 */
function scoreAndRankFiles(grepResults, limit = 5) {
  const fileScores = Object.keys(grepResults).map(file => {
    const patternMatches = Object.keys(grepResults[file]).length;
    const totalMatches = Object.values(grepResults[file])
      .reduce((acc, content) => acc + content.split('\n').length, 0);
    
    return {
      file,
      score: patternMatches * 2 + totalMatches,
      patternMatches,
      totalMatches
    };
  });

  fileScores.sort((a, b) => b.score - a.score);
  
  // Take top N files or less if fewer matches
  return fileScores.slice(0, limit);
}

module.exports = {
  executeGrepSearches,
  scoreAndRankFiles
};
