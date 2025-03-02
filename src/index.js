#!/usr/bin/env node

require('dotenv').config();

// Import services and utilities
const { setupProgram } = require('./cli/program');
const { validateApiKey, getGrepPatterns, analyzeCode } = require('./services/openai');
const { executeGrepSearches, scoreAndRankFiles } = require('./services/grep');
const { findFilesByExtension, extractCodeChunks } = require('./services/file');
const logger = require('./utils/logger');

/**
 * Main function that orchestrates the code analysis process
 */
async function main() {
  try {
    // Validate OpenAI API key
    validateApiKey();
    
    // Set up CLI program and get options
    const { options } = setupProgram();
    
    // Log analysis start
    logger.logAnalysisStart(options);
    
    // Step 1: Get grep patterns from GPT-4
    logger.log('\nDetermining search patterns...');
    const grepPatterns = await getGrepPatterns(options.query);
    logger.logSearchPatterns(grepPatterns);
    
    // Step 2: Find relevant files
    const extensionList = options.extensions.split(',').map(ext => ext.trim());
    const allFiles = await findFilesByExtension(extensionList, options.directory);
    logger.logFoundFiles(allFiles, options.extensions);
    
    // Step 3: Execute grep searches
    const grepResults = await executeGrepSearches(grepPatterns, options.directory, extensionList);
    
    // Step 4: Score and rank files
    const topFiles = scoreAndRankFiles(grepResults);
    logger.logTopFiles(topFiles);
    
    // Step 5: Extract code chunks from top files
    const codeChunks = extractCodeChunks(topFiles, grepResults, options.directory);
    logger.logCodeChunks(codeChunks);
    
    // Step 6: Analyze code chunks with GPT-4
    logger.log('\nAnalyzing code with GPT-4...');
    const analysis = await analyzeCode(
      options.query,
      codeChunks,
      grepResults,
      grepPatterns,
      options.maxTokens
    );
    
    // Step 7: Output analysis
    logger.logAnalysis(analysis);
    
  } catch (error) {
    logger.error('Error during code analysis:', error);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  main
};
