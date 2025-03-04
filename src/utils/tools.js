const { executeLs, lsSchema } = require('../tools/executeLs');
const { readFile, readFileSchema } = require('../tools/readFile');
const { searchGrep, searchGrepSchema } = require('../tools/searchGrep');
const { validateSchema } = require('./validation');
const { addMessage } = require('./context');

// Define available tools and their schemas
const tools = {
  listDirectories: {
    schema: lsSchema,
    execute: executeLs,
    description: "Lists files and directories in the specified path. Takes a directory path and options for the ls command (e.g., '-la' for detailed listing including hidden files). Returns an array of file and directory names found at the path location.",
    format: (result) => {
      return result.directories;
    }
  },
  readFile: {
    schema: readFileSchema,
    execute: readFile,
    description: "Reads and returns the contents of a file at the specified path. Takes a file path and optional encoding (defaults to 'utf-8'). ONLY works with files, not directories. Returns the text content of the file.",
    format: (result) => {
      return result.content;
    }
  },
  searchGrep: {
    schema: searchGrepSchema,
    execute: searchGrep,
    description: "Searches for a specified pattern in files using grep. Takes a search pattern, path to search within, and optional grep command options (defaults to '-r' for recursive search). Returns an array of matching lines with their file locations.",
    format: (result) => {
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
    addMessage('user', JSON.stringify(result));
  } catch (error) {
    console.error("Error:", error.error || error.message);
    addMessage('user',  JSON.stringify(error.error || error.message));
  }
}

module.exports = {
  tools,
  executeTool
};
