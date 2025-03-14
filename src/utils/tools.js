const { listDirectories, listDirectoriesSchema } = require('../tools/listDirectories');
const { readFile, readFileSchema } = require('../tools/readFile');
const { grepSearch, grepSearchSchema } = require('../tools/searchGrep');
const { findFiles, findFilesSchema } = require('../tools/findFiles');
const { createFile, createFileSchema } = require('../tools/createFile');
const { updateFile, updateFileSchema } = require('../tools/updateFile');
const { webSearch, webSearchSchema } = require('../tools/webSearch');
const { showInfo, showInfoSchema } = require('../tools/showInfo');
const { readPdfFile, readPdfFileSchema } = require('../tools/readPdfFile');
const { getWebsiteContent, getWebsiteContentSchema } = require('../tools/getWebsiteContent');
const { executeCommand, executeCommandSchema } = require('../tools/executeCommand');
// const { askUser, askUserSchema } = require('../tools/askUser');
const { validateSchema } = require('./validation');
const logger = require('./logger');
const inquirer = require('inquirer');


// Define available tools and their schemas
const tools = {
  list_directories: {
    schema: listDirectoriesSchema,
    execute: listDirectories,
    format: (result) => {
      logger.debug(`-- Matches: ${result.directories.length}`);
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
      logger.debug(`-- Matches: ${result.matches.length}`);
      return result;
    }
  },
  find_files: {
    schema: findFilesSchema,
    execute: findFiles,
    format: (result) => {
      logger.debug(`-- Matches: ${result.files.length}`);
      return result;
    }
  },
  create_file: {
    schema: createFileSchema,
    execute: createFile,
    requiresConfirmation: true,
    format: (result) => {
      logger.debug(` ✅ ${result.filePath} created successfully`);
      return result;
    }
  },
  web_search: {
    schema: webSearchSchema,
    execute: webSearch,
    format: (result) => {
      logger.debug(`-- Results: ${result.results.length}`);
      return result;
    }
  },
  update_file: {
    schema: updateFileSchema,
    execute: updateFile,
    requiresConfirmation: true,
    format: (result) => {
      if (result.status === 'error') {
        logger.debug(` ❌ Error updating ${result.path}`);
      } else {
        logger.debug(` ✅ ${result.path} updated successfully`);
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
  read_pdf_file: {
    schema: readPdfFileSchema,
    execute: readPdfFile,
    format: (result) => {
      if (result.status === 'error') {
        logger.debug(` ❌ Error reading PDF ${result.path}`);
      } else {
        logger.debug(` ✅ Read PDF: ${result.path} (${result.pages} pages, ${result.size} bytes)`);
      }
      return result;
    }
  },
  get_website_content: {
    schema: getWebsiteContentSchema,
    execute: getWebsiteContent,
    format: (result) => {
      logger.debug(` ✅ Got content from ${result.url} (${result.chunks.length}/${result.totalChunks} chunks)`);
      return result;
    }
  },
  execute_command: {
    schema: executeCommandSchema,
    execute: executeCommand,
    format: (result) => {
      if (result.status === 'error') {
        logger.error(` ❌ Command execution failed: ${result.error}`);
      } else {
        logger.info(` ✅ Command executed successfully: \n ${result.stdout}`);
      }
      return result;
    },
    requiresConfirmation: true
  },
  // ask_user: {
  //   schema: askUserSchema,
  //   execute: askUser,
  //   format: (result) => {
  //     if (result.status === 'error') {
  //       logger.error(` ❌ Failed to get user input: ${result.error}`);
  //       return result;
  //     }
  //     logger.debug(` ✅ Received user input`);
  //     return result;
  //   }
  // },
};

/**
 * Ask for user confirmation before executing a tool
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Arguments to pass to the tool
 * @returns {Promise<boolean>} - Whether the user confirmed the action
 */
async function confirmToolExecution(toolName, args) {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Do you want to execute ${toolName}${['create_file', 'update_file'].includes(toolName) ? '' : ` with arguments: ${JSON.stringify(args)}`}?`,
        default: false
      }
    ]);
    
    return answers.confirm;
  } catch (error) {
    logger.error(`Error during user confirmation: ${error.message}`);
    // Return false on error to safely abort the action
    return false;
  }
}

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
  
  // Check if the tool requires confirmation
  if (tool.requiresConfirmation) {
    const confirmed = await confirmToolExecution(toolName, args);
    if (!confirmed) {
      logger.debug(` ❌ User aborted execution of ${toolName}`);
      return `${toolName} ERROR: USER ABORT ACTION, TRY OTHER SIMILAR APPROACH`;
    }
  }

  try {
    const rawResult = await tool.execute(...Object.values(args));
    const result = tool.format(rawResult);
    return `${toolName} RESULT: ${JSON.stringify(result)}`;
  } catch (error) {
    logger.error(`Tool error: ${JSON.stringify(error)}`);
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
      parameters: schema,
      strict: true
    }
  }));
}

module.exports = {
  tools,
  executeTool,
  getFunctionSchemas
};
