const { executeLs, lsSchema } = require('../tools/executeLs');
const { readFile, readFileSchema } = require('../tools/readFile');
const { searchGrep, searchGrepSchema } = require('../tools/searchGrep');
const { validateSchema } = require('./validation');
const { addMessage } = require('./context');

// Define available tools and their schemas
const tools = {
  list_directories: {
    schema: lsSchema,
    execute: executeLs,
    description: "Lists files and directories in the specified path.",
    format: (result) => {
      console.log(`-- Matches: ${result.directories.length}`);
      return result.directories;
    }
  },
  read_file_content: {
    schema: readFileSchema,
    execute: readFile,
    description: "Reads and returns the contents of a file at the specified path.",
    format: (result) => {
      return result.content;
    }
  },
  grep_search: {
    schema: searchGrepSchema,
    execute: searchGrep,
    description: "Searches for a specified pattern in files using grep.",
    format: (result) => {
      console.log(`-- Matches: ${result.matches.length}`);
      return result.matches;
    }
  },
};

/**
 * Execute a tool with the provided arguments
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Arguments to pass to the tool
 */
async function executeTool(toolName, args) {
  const tool = tools[toolName];
  if (!tool) {
    console.error(`Unknown tool: ${toolName}`);
    addMessage('user', `Unknown tool: ${toolName}`);
    return;
  }

  if (!validateSchema(args, tool.schema)) {
    console.error(`Invalid arguments for '${toolName}'`);
    addMessage('user', `Invalid arguments for '${toolName}'`);
    return;
  }

  try {
    const rawResult = await tool.execute(...Object.values(args));
    const result = tool.format(rawResult);
    addMessage('user', `${toolName} RESULT: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error("Error:", error.error || error.message);
    addMessage('user', `${toolName} ERROR: ${error.error || error.message}`);
  }
}

module.exports = {
  tools,
  executeTool
};
