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
    const grepPatterns = await getGrepPatterns(
      options.query,
      options.directory,
      options.extensions,
      options.ignore
    );
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
    
    // Check if we have valid results from grep search
    const hasGrepResults = Object.keys(grepResults).length > 0;
    let codeChunks = [];
    
    if (hasGrepResults) {
      // Step 5: Extract code chunks from top files
      logger.log('\nStep 5: Extracting relevant code chunks for analysis...');
      codeChunks = extractCodeChunks(topFiles, grepResults);
      logger.logCodeChunks(codeChunks);
    } else {
      // If no grep results, try direct file content analysis
      logger.log('\nNo grep matches found. Switching to direct file content analysis...');
      
      const { readFilesContent } = require('./services/file');
      
      // Get all files in target directory for analysis
      const filesForAnalysis = topFiles.map(item => item.file);
      logger.log(`Analyzing ${filesForAnalysis.length} files directly`);
      
      // Read the file contents directly
      const fileContents = readFilesContent(filesForAnalysis);
      
      // Convert file contents to code chunks format
      fileContents.forEach(({file, content}) => {
        // Only include non-empty files and limit size for API call
        if (content && content.trim()) {
          const maxContentLength = 8000; // Adjust as needed to keep under token limit
          const truncatedContent = content.length > maxContentLength ? 
            content.substring(0, maxContentLength) + '\n... (truncated)' : 
            content;
          
          codeChunks.push({
            file,
            content: truncatedContent,
            lineStart: 1,
            lineEnd: truncatedContent.split('\n').length
          });
        }
      });
      
      logger.logCodeChunks(codeChunks);
    }
    
    // If we still have no code chunks, stop the analysis
    if (codeChunks.length === 0) {
      logger.log('\nNo code could be extracted for analysis. Please try a different query or modify the search parameters.');
      return;
    }
    
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
