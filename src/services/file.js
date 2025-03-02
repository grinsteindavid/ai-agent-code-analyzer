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
  
  // Create glob patterns
  const patterns = extArray.map(ext => `**/*.${ext}`);
  
  // Use glob to find files
  const files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, {
      cwd: directory,
      absolute: true,
      ignore: ignoreArray.map(i => `**/${i}/**`)
    });
    files.push(...matches);
  });
  
  return files;
}

/**
 * Extract code chunks from files
 * @param {string[]} topFiles - Array of top file paths
 * @param {Object} grepResults - Results from grep searches
 * @param {number} contextLines - Number of context lines around matches
 * @returns {Array} Array of code chunks with file and line information
 */
function extractCodeChunks(topFiles, grepResults, contextLines = 10) {
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

module.exports = {
  findFilesByExtension,
  extractCodeChunks
};
