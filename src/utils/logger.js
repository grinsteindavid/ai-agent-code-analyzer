/**
 * Logger utility
 * Simple wrapper around console for consistent logging
 */

/**
 * Log a message or object
 * @param {string|Object} message - The message or object to log
 */
function log(message) {
  console.log(message);
}

/**
 * Log an error message
 * @param {string} message - The error message
 * @param {Error} [error] - Optional error object
 */
function error(message, error = null) {
  console.error(message);
  if (error && error.response) {
    console.error('API error:', error.response.data);
  } else if (error) {
    console.error(error.message || error);
  }
}

/**
 * Log the start of the analysis process
 * @param {Object} options - CLI options
 */
function logAnalysisStart(options) {
  log('Starting code analysis...');
  log(`Query: ${options.query}`);
  log(`Analyzing directory: ${options.directory}`);
  log(`File extensions: ${options.extensions}`);
}

/**
 * Log the generated search patterns
 * @param {string[]} patterns - Array of grep patterns
 */
function logSearchPatterns(patterns) {
  log(`Generated search patterns: ${JSON.stringify(patterns)}`);
}

/**
 * Log information about found files
 * @param {string[]} files - Array of file paths
 * @param {string} extensions - String of extensions searched
 */
function logFoundFiles(files, extensions) {
  log(`\nFound ${files.length} files with extensions: ${extensions}`);
}

/**
 * Log information about top files
 * @param {Array} topFiles - Array of top ranked files
 */
function logTopFiles(topFiles) {
  log('\nTop files identified:');
  topFiles.forEach(({file, score, patternMatches, totalMatches}) => {
    log(`- ${file} (Score: ${score}, Patterns: ${patternMatches}, Matches: ${totalMatches})`);
  });
}

/**
 * Log information about extracted code chunks
 * @param {Array} codeChunks - Array of code chunks
 */
function logCodeChunks(codeChunks) {
  log(`\nExtracted ${codeChunks.length} code chunks for analysis`);
}

/**
 * Log the final analysis
 * @param {string} analysis - The GPT-4 analysis
 */
function logAnalysis(analysis) {
  log('\n==== CODE ANALYSIS ====\n');
  log(analysis);
  log('\n==== END OF ANALYSIS ====');
}

module.exports = {
  log,
  error,
  logAnalysisStart,
  logSearchPatterns,
  logFoundFiles,
  logTopFiles,
  logCodeChunks,
  logAnalysis
};
