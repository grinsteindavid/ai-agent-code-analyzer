const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Find files by extension in a directory
 * @param {string} directory - Directory to search in
 * @param {string} extensions - Comma-separated list of file extensions
 * @param {string} ignore - Comma-separated list of patterns to ignore
 * @returns {string[]} Array of file paths
 */
function findFilesByExtension(directory, extensions, ignore) {
  const extArray = extensions.split(',');
  const ignoreArray = ignore.split(',');
  
  // Debug logs
  console.log(`DEBUG findFilesByExtension: Directory: ${directory}`);
  console.log(`DEBUG findFilesByExtension: Extensions: ${extArray}`);
  console.log(`DEBUG findFilesByExtension: Ignore: ${ignoreArray}`);
  
  // Create glob patterns
  const patterns = extArray.map(ext => `**/*.${ext}`);
  console.log(`DEBUG findFilesByExtension: Glob patterns: ${patterns}`);
  
  // Use glob to find files
  const files = [];
  patterns.forEach(pattern => {
    const ignorePatterns = ignoreArray.map(i => `**/${i}/**`);
    console.log(`DEBUG findFilesByExtension: Ignore patterns: ${ignorePatterns}`);
    
    const matches = glob.sync(pattern, {
      cwd: directory,
      absolute: true,
      ignore: ignorePatterns
    });
    console.log(`DEBUG findFilesByExtension: Found ${matches.length} files for pattern ${pattern}`);
    files.push(...matches);
  });
  
  console.log(`DEBUG findFilesByExtension: Total files found: ${files.length}`);
  return files;
}

/**
 * Extract code chunks from files
 * @param {string[]} topFiles - Array of top file paths
 * @param {Object} grepResults - Results from grep searches
 * @param {number} contextLines - Number of context lines around matches
 * @returns {Array} Array of code chunks with file and line information
 */
function extractCodeChunks(topFiles, grepResults, contextLines = 100) {
  const codeChunks = [];
  
  topFiles.forEach(({file}) => {
    // Read file content
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    // Collect all line numbers with matches
    const matchedLines = new Set();
    Object.keys(grepResults[file] || {}).forEach(pattern => {
      const matches = grepResults[file][pattern];
      const lineMatches = matches.match(/:\d+:/g) || [];
      lineMatches.forEach(lineMatch => {
        const lineNum = parseInt(lineMatch.replace(/[^0-9]/g, ''), 10);
        matchedLines.add(lineNum);
      });
    });
    
    // Extract chunks around matched lines
    const processedLineRanges = [];
    const sortedLines = Array.from(matchedLines).sort((a, b) => a - b);
    
    let currentChunkStart = null;
    let currentChunkEnd = null;
    
    sortedLines.forEach(lineNum => {
      // Convert to 0-based index
      const lineIndex = lineNum - 1;
      
      // Calculate context boundaries
      const chunkStart = Math.max(0, lineIndex - contextLines);
      const chunkEnd = Math.min(lines.length - 1, lineIndex + contextLines);
      
      // Check for overlap with existing chunk
      if (currentChunkStart !== null && chunkStart <= currentChunkEnd + 5) { // Allow small gaps
        currentChunkEnd = Math.max(currentChunkEnd, chunkEnd);
      } else {
        // Save previous chunk if exists
        if (currentChunkStart !== null) {
          processedLineRanges.push([currentChunkStart, currentChunkEnd]);
        }
        // Start new chunk
        currentChunkStart = chunkStart;
        currentChunkEnd = chunkEnd;
      }
    });
    
    // Add the last chunk
    if (currentChunkStart !== null) {
      processedLineRanges.push([currentChunkStart, currentChunkEnd]);
    }
    
    // Extract content for each chunk
    processedLineRanges.forEach(([startLine, endLine]) => {
      const chunkContent = lines.slice(startLine, endLine + 1).join('\n');
      codeChunks.push({
        file,
        startLine: startLine + 1, // Convert back to 1-based for human readability
        endLine: endLine + 1,
        content: chunkContent
      });
    });
  });
  
  return codeChunks;
}

/**
 * Read entire file contents for direct analysis
 * @param {Array} files - Array of file paths to read
 * @returns {Array} Array of objects with file path and content
 */
function readFilesContent(files) {
  console.log(`DEBUG readFilesContent: Reading content from ${files.length} files`);
  
  const fileContents = [];
  
  files.forEach(file => {
    try {
      // Read the entire file content
      const content = fs.readFileSync(file, 'utf-8');
      
      // Add file and content to the array
      fileContents.push({
        file,
        content
      });
      
      console.log(`DEBUG readFilesContent: Successfully read ${file}, size: ${content.length} bytes`);
    } catch (error) {
      console.log(`DEBUG readFilesContent: Error reading ${file}: ${error.message}`);
    }
  });
  
  return fileContents;
}

module.exports = {
  findFilesByExtension,
  extractCodeChunks,
  readFilesContent
};
