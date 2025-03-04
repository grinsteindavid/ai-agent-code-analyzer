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
 *
 * @returns {Promise<Object>} A promise that resolves to an object with matches array.
 */
function grepSearch(SearchDirectory, Query, Includes, MatchPerLine, CaseInsensitive) {
  return new Promise((resolve, reject) => {
    // Construct the base grep command
    let cmd = `grep -r`;
    if (CaseInsensitive) {
      cmd += " -i";
    }
    // If MatchPerLine is true, use the -o flag to output only matching parts.
    if (MatchPerLine) {
      cmd += " -o";
    }
    // Append include patterns
    (Includes || []).forEach(pattern => {
      cmd += ` --include="${pattern}"`;
    });
    // Append the query and search directory
    cmd += ` "${Query}" "${SearchDirectory}"`;
    
    exec(cmd, (err, stdout, stderr) => {
      // grep returns exit code 1 when no matches found, which is not an error for our use case
      if (err && err.code !== 1) {
        reject({ error: stderr || err.message });
      } else {
        const results = stdout ? stdout.split("\n").filter(Boolean) : [];
        resolve({ matches: results });
      }
    });
  });
}

module.exports = {
  grepSearch,
  grepSearchSchema
};
