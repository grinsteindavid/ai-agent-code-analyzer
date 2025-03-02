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
    logger.logAnalysisStart(options);
    
    // Step 1: Generate grep patterns using OpenAI
    logger.log('\nStep 1: Generating search patterns based on your question...');
    const grepPatterns = await getGrepPatterns(options.query);
    logger.logSearchPatterns(grepPatterns);
    
    // Step 2: Find files with matching extensions in the directory
    logger.log('\nStep 2: Searching for files with specified extensions...');
    const files = findFilesByExtension(options.directory, options.extensions, options.ignore);
    logger.logFoundFiles(files, options.extensions);
    
    // Step 3: Execute grep searches with the patterns
    logger.log('\nStep 3: Searching code with generated patterns...');
    const grepResults = await executeGrepSearches(grepPatterns, options.directory, options.extensions, options.ignore);
    
    // Step 4: Score and rank files based on grep results
    logger.log('\nStep 4: Identifying most relevant files...');
    const topFiles = scoreAndRankFiles(grepResults, grepPatterns);
    logger.logTopFiles(topFiles);
    
    // Step 5: Extract code chunks from top files
    logger.log('\nStep 5: Extracting relevant code chunks for analysis...');
    const codeChunks = extractCodeChunks(topFiles, grepResults);
    logger.logCodeChunks(codeChunks);
    
    // Step 6: Analyze code with OpenAI
    logger.log('\nStep 6: Analyzing code with OpenAI...');
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
