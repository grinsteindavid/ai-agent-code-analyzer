const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Find files with specific extensions
 * @param {string[]} extensions - File extensions to search for
 * @param {string} directory - Directory to search in
 * @returns {Promise<string[]>} Array of file paths
 */
function findFilesByExtension(extensions, directory) {
  const filePatterns = extensions.map(ext => `**/*.${ext}`);
  
  return new Promise((resolve, reject) => {
    glob(filePatterns, { cwd: directory, ignore: '**/node_modules/**' }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

/**
 * Extract code chunks from files based on grep results
 * @param {Array} topFiles - Array of top-ranked files
 * @param {Object} grepResults - Object with grep results
 * @param {string} directory - Base directory
 * @returns {Array} Array of code chunks
 */
function extractCodeChunks(topFiles, grepResults, directory) {
  const codeChunks = [];
  const maxChunkSize = 100; // Max lines per chunk

  for (const {file} of topFiles) {
    console.log(`\nExtracting code from: ${file}`);
    try {
      const fileContent = fs.readFileSync(path.resolve(directory, file), 'utf8');
      const fileLines = fileContent.split('\n');
      
      // Get matches and their line numbers
      const matchLines = new Set();
      Object.values(grepResults[file]).forEach(content => {
        content.split('\n').forEach(line => {
          const lineNumber = parseInt(line.split(':')[0]) - 1;
          if (!isNaN(lineNumber)) {
            matchLines.add(lineNumber);
          }
        });
      });
      
      // Group adjacent matches into chunks
      const lineArray = Array.from(matchLines).sort((a, b) => a - b);
      let currentChunkStart = null;
      let currentChunkEnd = null;
      
      for (let i = 0; i <= lineArray.length; i++) {
        const lineNum = lineArray[i];
        
        if (currentChunkStart === null) {
          currentChunkStart = lineNum;
          currentChunkEnd = lineNum;
        } else if (i === lineArray.length || lineNum > currentChunkEnd + 20) {
          // Ensure we don't exceed max chunk size
          if (currentChunkEnd - currentChunkStart > maxChunkSize) {
            // Split into multiple chunks
            for (let start = currentChunkStart; start < currentChunkEnd; start += maxChunkSize) {
              const end = Math.min(start + maxChunkSize, currentChunkEnd);
              const chunkLines = fileLines.slice(start, end + 1);
              codeChunks.push({
                file,
                startLine: start + 1,
                endLine: end + 1,
                content: chunkLines.join('\n')
              });
            }
          } else {
            // Add context around the chunk (up to 10 lines before and after)
            const contextStart = Math.max(0, currentChunkStart - 10);
            const contextEnd = Math.min(fileLines.length - 1, currentChunkEnd + 10);
            const chunkLines = fileLines.slice(contextStart, contextEnd + 1);
            
            codeChunks.push({
              file,
              startLine: contextStart + 1,
              endLine: contextEnd + 1,
              content: chunkLines.join('\n')
            });
          }
          
          // Start a new chunk
          if (i < lineArray.length) {
            currentChunkStart = lineNum;
            currentChunkEnd = lineNum;
          } else {
            currentChunkStart = null;
            currentChunkEnd = null;
          }
        } else {
          currentChunkEnd = lineNum;
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error.message);
    }
  }

  return codeChunks;
}

module.exports = {
  findFilesByExtension,
  extractCodeChunks
};
