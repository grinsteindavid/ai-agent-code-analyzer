const { executeLs, lsSchema } = require('../tools/executeLs');
const { readFile, readFileSchema } = require('../tools/readFile');
const { validateSchema } = require('./validation');
const { addMessage } = require('./context');

// Define available tools and their schemas
const tools = {
  ls: {
    schema: lsSchema,
    execute: executeLs,
    formatResult: (result) => console.log(result.directories)
  },
  readFile: {
    schema: readFileSchema,
    execute: readFile,
    formatResult: (result) => console.log(result.content)
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
    console.log(`Unknown tool: ${toolName}`);
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
    tool.formatResult(result);
  } catch (error) {
    console.error("Error:", error.error || error.message);
    addMessage('user',  error.message);
  }
}

module.exports = {
  tools,
  executeTool
};
