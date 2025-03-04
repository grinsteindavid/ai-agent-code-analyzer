const { exec } = require('child_process');

/**
 * JSON Schema for grep_search function parameters.
 */
const grepSearchSchema = {
  type: "object",
  properties: {
    SearchDirectory: {
      type: "string",
      description: "The root directory where the grep search will be performed."
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
      description: "If true, grep will output only the matching portion of each line (using the -o flag)."
    },
    CaseInsensitive: {
      type: "boolean",
      description: "If true, the search will be case-insensitive (using the -i flag)."
    }
  },
  required: ["SearchDirectory", "Query", "Includes", "MatchPerLine", "CaseInsensitive"],
  additionalProperties: false,
  description: "Schema for validating the input parameters of the grep_search function."
};

/**
 * Executes a grep search based on the given parameters.
 *
 * @param {string} SearchDirectory - Directory where grep will search.
 * @param {string} Query - The string to search for.
 * @param {string[]} Includes - Array of file glob patterns to include.
 * @param {boolean} MatchPerLine - If true, prints only the matching part.
 * @param {boolean} CaseInsensitive - If true, the search is case insensitive.
 * @param {number} [maxResults=50] - Maximum number of results to return.
 * @param {number} [maxBufferSize=1024 * 1024 * 10] - Maximum buffer size in bytes (default 10MB).
 *
 * @returns {Promise<Object>} A promise that resolves to an object with matches array and metadata.
 */
function grepSearch(SearchDirectory, Query, Includes, MatchPerLine, CaseInsensitive, maxResults = 50, maxBufferSize = 1024 * 1024 * 10) {
  return new Promise((resolve, reject) => {
    // Add -m option to limit results and prevent buffer overflows
    let cmd = `grep -r --max-count=${maxResults}`;
    
    if (CaseInsensitive) {
      cmd += " -i";
    }
    // If MatchPerLine is true, use the -o flag to output only matching parts.
    if (MatchPerLine) {
      cmd += " -o";
    }
    
    // Append include patterns if provided
    if (Includes && Includes.length > 0) {
      Includes.forEach(pattern => {
        cmd += ` --include="${pattern}"`;
      });
    } else {
      // Exclude common binary and large files to reduce output size
      cmd += ` --exclude="*.min.js" --exclude="*.map" --exclude="node_modules/**" --exclude=".git/**"` +
             ` --exclude="*.jpg" --exclude="*.png" --exclude="*.gif" --exclude="*.svg"` +
             ` --exclude="*.pdf" --exclude="*.zip" --exclude="*.tar" --exclude="*.gz"`;
    }
    
    // Append the query and search directory
    cmd += ` "${Query}" "${SearchDirectory}"`;
    
    // Increase maxBuffer to handle large outputs
    exec(cmd, { maxBuffer: maxBufferSize }, (err, stdout, stderr) => {
      // grep returns exit code 1 when no matches found, which is not an error for our use case
      if (err && err.code !== 1) {
        reject({ 
          error: stderr || err.message,
          command: cmd,
          code: err.code
        });
      } else {
        const results = stdout ? stdout.split("\n").filter(Boolean) : [];
        const wasLimited = results.length >= maxResults;
        
        resolve({ 
          matches: results,
          metadata: {
            totalMatches: results.length,
            wasLimited,
            searchCommand: cmd
          }
        });
      }
    });
  });
}

module.exports = {
  grepSearch,
  grepSearchSchema
};
