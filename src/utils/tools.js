const { executeLs, lsSchema } = require('../tools/executeLs');
const { readFile, readFileSchema } = require('../tools/readFile');
const { validateSchema } = require('./validation');
const { addMessage } = require('./context');

// Define available tools and their schemas
const tools = {
  ls: {
    schema: lsSchema,
    execute: executeLs,
    description: "List files and directories in the specified path",
  },
  readFile: {
    schema: readFileSchema,
    execute: readFile,
    description: "Read the contents of a file at the specified path",
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
    const result = await tool.execute(...Object.values(args));
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
