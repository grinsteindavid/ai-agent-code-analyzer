const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const { StringDecoder } = require('string_decoder');
const logger = require('../utils/logger');

/**
 * Simple function to match a path against glob patterns
 * Supports basic * and ** wildcards
 * @param {string} filePath - Path to check
 * @param {string[]} patterns - Glob patterns to match against
 * @returns {boolean} - Whether the path matches any pattern
 */
function matchesAnyPattern(filePath, patterns) {
  return patterns.some(pattern => {
    // Convert glob pattern to regex
    // Replace ** with a special placeholder
    let regexPattern = pattern.replace(/\*\*/g, '___GLOBSTAR___');
    // Replace * with a non-globstar wildcard
    regexPattern = regexPattern.replace(/\*/g, '[^/]*');
    // Replace the globstar placeholder with wildcard for directories
    regexPattern = regexPattern.replace(/___GLOBSTAR___/g, '.*');
    // Escape regex special chars except * which we've already handled
    regexPattern = regexPattern.replace(/[.+?^${}()|[\\]]/g, '\\$&');
    // Add ^ and $ to match start and end of string
    regexPattern = `^${regexPattern}$`;
    
    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  });
}

/**
 * JSON Schema for grep_search function parameters.
 */
const grepSearchSchema = {
  type: "object",
  required: ["SearchDirectory", "Query", "Includes", "MatchPerLine", "CaseInsensitive", "maxResults", "maxBufferSize"],
  additionalProperties: false,
  properties: {
    SearchDirectory: {
      type: "string",
      description: "The root directory where the search will be performed."
    },
    Query: {
      type: "string",
      description: "The text pattern to search for within the specified files."
    },
    Includes: {
      type: "array",
      items: { type: "string" },
      description: "An array of file glob patterns to include in the search (e.g., ['src/**/*.ts'])."
    },
    MatchPerLine: {
      type: "boolean",
      description: "If true, only the matching portion of each line will be returned."
    },
    CaseInsensitive: {
      type: "boolean",
      description: "If true, the search will be case-insensitive."
    },
    maxResults: {
      type: "integer",
      description: "Maximum number of results to return. default 50",
    },
    maxBufferSize: {
      type: "integer",
      description: "Maximum buffer size in bytes for reading files (default: 1048576 / 1mb).",
    }
  },
  description: "Search and find text patterns in files, filtering lines by a specified pattern."
};

/**
 * Performs a text search using Node.js native modules (cross-platform alternative to grep).
 *
 * @param {string} SearchDirectory - Directory where the search will be performed.
 * @param {string} Query - The string to search for.
 * @param {string[]} Includes - Array of file glob patterns to include.
 * @param {boolean} MatchPerLine - If true, returns only the matching portion of each line.
 * @param {boolean} CaseInsensitive - If true, the search is case insensitive.
 * @param {number} [maxResults=50] - Maximum number of results to return.
 * @param {number} [maxBufferSize=1024 * 1024 * 10] - Maximum buffer size in bytes (default 10MB).
 *
 * @returns {Promise<Object>} A promise that resolves to an object with matches array and metadata.
 */
function grepSearch(SearchDirectory, Query, Includes, MatchPerLine, CaseInsensitive, maxResults = 50, maxBufferSize = 1048576) {
  return new Promise(async (resolve, reject) => {
    try {
      // Prepare search parameters
      const searchPattern = CaseInsensitive ? new RegExp(Query, 'i') : new RegExp(Query);
      const excludeExtensions = ['.min.js', '.map', '.jpg', '.png', '.gif', '.svg', '.pdf', '.zip', '.tar', '.gz'];
      const excludeDirs = ['node_modules', '.git'];
      
      // Track results and limits
      const results = [];
      let fileCount = 0;
      let searchComplete = false;
      const errors = []; // Track directory access errors
      
      // Walk directory recursively and search files
      await walkDir(SearchDirectory);
      
      // Return results
      const wasLimitedByMaxResultsOption = results.length >= maxResults;
      resolve({
        matches: results.slice(0, maxResults),
        metadata: {
          originalTotalMatches: results.length,
          wasLimitedByMaxResultsOption,
          searchCommand: `Native Node.js search in ${SearchDirectory} for "${Query}"`,
          errors: errors.length > 0 ? errors : undefined // Include errors if any occurred
        }
      });
      
      /**
       * Recursively walks a directory and searches files that match include patterns
       * @param {string} dirPath - Current directory path
       */
      async function walkDir(dirPath) {
        if (searchComplete) return;
        
        try {
          const entries = await readdir(dirPath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (searchComplete) return;
            
            const entryPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
              // Skip excluded directories
              if (excludeDirs.includes(entry.name)) {
                continue;
              }
              await walkDir(entryPath);
            } 
            else if (entry.isFile()) {
              // Check if file matches include patterns
              const fileExt = path.extname(entry.name);
              
              // For include patterns, we need to use the path relative to the search directory
              const relativePath = path.relative(SearchDirectory, entryPath);
              
              const shouldInclude = Includes && Includes.length > 0 ?
                matchesAnyPattern(relativePath, Includes) :
                !excludeExtensions.includes(fileExt);
              
              if (shouldInclude) {
                fileCount++;
                await searchFile(entryPath);
              }
            }
          }
        } catch (err) {
          // Skip inaccessible directories but track the error
          const errorInfo = { path: dirPath, message: err.message };
          errors.push(errorInfo);
          logger.debug(`Error reading directory ${dirPath}: ${err.message}`);
        }
      }
      
      /**
       * Searches a file for matches
       * @param {string} filePath - Path to the file
       */
      async function searchFile(filePath) {
        if (searchComplete) return;
        
        try {
          // Check file size and skip if too large
          const fileStat = await stat(filePath);
          if (fileStat.size > maxBufferSize) {
            return;
          }
          
          // Read file and search for matches
          const buffer = await readFile(filePath);
          
          // Try to decode as UTF-8, but handle binary files gracefully
          const decoder = new StringDecoder('utf8');
          let content;
          try {
            content = decoder.write(buffer) + decoder.end();
          } catch (e) {
            // Skip binary files that can't be decoded
            return;
          }
          
          // Search line by line
          const lines = content.split('\n');
          for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            
            if (searchPattern.test(line)) {
              if (MatchPerLine) {
                // Extract only matching portions
                let match;
                const matchRegex = CaseInsensitive ? 
                  new RegExp(Query, 'gi') : new RegExp(Query, 'g');
                
                while ((match = matchRegex.exec(line)) !== null) {
                  results.push(`${filePath}:${lineNum + 1}:${match[0]}`);
                  
                  if (results.length >= maxResults) {
                    searchComplete = true;
                    break;
                  }
                }
              } else {
                // Add whole line with file path and line number
                results.push(`${filePath}:${lineNum + 1}:${line}`);
                
                if (results.length >= maxResults) {
                  searchComplete = true;
                  break;
                }
              }
            }
            
            if (searchComplete) break;
          }
        } catch (err) {
          // Skip files that can't be read
          console.error(`Error reading file ${filePath}: ${err.message}`);
        }
      }
    } catch (err) {
      reject({
        error: err.message,
        code: err.code || 'UNKNOWN'
      });
    }
  });
}

module.exports = {
  grepSearch,
  grepSearchSchema
};
