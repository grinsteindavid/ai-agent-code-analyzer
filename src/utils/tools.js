const { executeLs, lsSchema } = require('../tools/executeLs');
const { readFile, readFileSchema } = require('../tools/readFile');
const { validateSchema } = require('./validation');

// Define available tools and their schemas
const tools = {
  ls: {
    schema: lsSchema,
    execute: executeLs,
    formatResult: (result) => console.log("Directories:", result.directories)
  },
  readFile: {
    schema: readFileSchema,
    execute: readFile,
    formatResult: (result) => console.log("File Content:\n", result.content)
  }
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
    return;
  }

  if (!validateSchema(args, tool.schema)) {
    console.error(`Invalid arguments for '${toolName}'.`);
    return;
  }

  try {
    const result = await tool.execute(...Object.values(args));
    tool.formatResult(result);
  } catch (error) {
    console.error("Error:", error.error || error.message);
  }
}

module.exports = {
  tools,
  executeTool
};
