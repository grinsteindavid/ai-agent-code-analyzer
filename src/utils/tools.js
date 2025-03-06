const { listDirectories, listDirectoriesSchema } = require('../tools/listDirectories');
const { readFile, readFileSchema } = require('../tools/readFile');
const { grepSearch, grepSearchSchema } = require('../tools/searchGrep');
const { findFiles, findFilesSchema } = require('../tools/findFiles');
const { createFile, createFileSchema } = require('../tools/createFile');
const { updateFile, updateFileSchema } = require('../tools/updateFile');
const { webSearch, webSearchSchema } = require('../tools/webSearch');
const { showInfo, showInfoSchema } = require('../tools/showInfo');
const { validateSchema } = require('./validation');
const { addMessage } = require('./context');

// Define available tools and their schemas
const tools = {
  list_directories: {
    schema: listDirectoriesSchema,
    execute: listDirectories,
    format: (result) => {
      console.log(`-- Matches: ${result.directories.length}`);
      return result;
    }
  },
  read_file_content: {
    schema: readFileSchema,
    execute: readFile,
    format: (result) => {
      return result.content;
    }
  },
  grep_search: {
    schema: grepSearchSchema,
    execute: grepSearch,
    format: (result) => {
      console.log(`-- Matches: ${result.matches.length}`);
      return result;
    }
  },
  find_files: {
    schema: findFilesSchema,
    execute: findFiles,
    format: (result) => {
      console.log(`-- Matches: ${result.files.length}`);
      return result;
    }
  },
  create_file: {
    schema: createFileSchema,
    execute: createFile,
    format: (result) => {
      console.log(` ✅ ${result.message}`);
      return result;
    }
  },
  web_search: {
    schema: webSearchSchema,
    execute: webSearch,
    format: (result) => {
      console.log(`-- Results: ${result.results.length}`);
      return result;
    }
  },
  update_file: {
    schema: updateFileSchema,
    execute: updateFile,
    format: (result) => {
      if (result.status === 'error') {
        console.error(` ❌ Error updating ${result.path}`);
      } else {
        console.log(` ✅ ${result.path} updated successfully`);
      }
      return result;
    }
  },
  show_info: {
    schema: showInfoSchema,
    execute: showInfo,
    format: (result) => {
      // Output already handled in the showInfo function
      return result;
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
    return `Unknown tool: ${toolName}`;
  }

  if (!validateSchema(args, tool.schema)) {
    console.error(`Invalid arguments for '${toolName}'`);
    return `Invalid arguments for '${toolName}'`;
  }

  try {
    const rawResult = await tool.execute(...Object.values(args));
    const result = tool.format(rawResult);
    return `${toolName} RESULT: ${JSON.stringify(result)}`;
  } catch (error) {
    console.error(`Tool error:`, error || error.error || error.message);
    return `${toolName} ERROR: ${JSON.stringify(error ||error.error || error.message)}`;
  }
}

/**
 * Get available tool schemas for AI in the format required by providers
 * @returns {Array} Array of function schemas
 */
function getFunctionSchemas() {
  return Object.entries(tools).map(([name, { schema }]) => ({
    type: "function",
    function: {
      name,
      description: schema.description,
      parameters: schema
    }
  }));
}

module.exports = {
  tools,
  executeTool,
  getFunctionSchemas
};
