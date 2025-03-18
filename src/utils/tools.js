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
const { createPdfSchema, createPdf } = require('../tools/createPdf');


// Define available tools and their schemas
const tools = {
  list_directories: {
    schema: listDirectoriesSchema,
    execute: listDirectories,
    format: (result) => {
      if (result.directories.length > 0) {
        logger.success(`Matches: ${result.directories.length}`);
      } else {
        logger.debug(`-- No directories found`);
      }
      return result;
    }
  },
  read_file_content: {
    schema: readFileSchema,
    execute: readFile,
    format: (result) => {
      logger.success(` Read file ${result.path} (${result.content.length} bytes)`);
      return result.content;
    }
  },
  grep_search: {
    schema: grepSearchSchema,
    execute: grepSearch,
    format: (result) => {
      if (result.matches.length > 0) {
        logger.success(` Matches: ${result.matches.length}`);
      } else {
        logger.debug(`-- No matches found`);
      }
      return result;
    }
  },
  find_files: {
    schema: findFilesSchema,
    execute: findFiles,
    format: (result) => {
      if (result.files.length > 0) {
        logger.success(` Matches: ${result.files.length}`);
      } else {
        logger.debug(`-- No files found`);
      }
      return result;
    }
  },
  create_file: {
    schema: createFileSchema,
    execute: createFile,
    requiresConfirmation: true,
    format: (result) => {
      logger.success(` ${result.filePath} created successfully`);
      return result;
    }
  },
  web_search: {
    schema: webSearchSchema,
    execute: webSearch,
    format: (result) => {
      if (result.results.length > 0) {
        logger.success(` Results: ${result.results.length}`);
      } else {
        logger.debug(`-- No results found`);
      }
      return result;
    }
  },
  update_file: {
    schema: updateFileSchema,
    execute: updateFile,
    requiresConfirmation: true,
    format: (result) => {
      if (result.status === 'error') {
        logger.error(` ❌ Error updating ${result.path}`);
      } else {
        logger.success(` ${result.path} updated successfully`);
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
        logger.error(` ❌ Error reading PDF ${result.path}`);
      } else {
        logger.success(` Read PDF: ${result.path} (${result.pages} pages, ${result.size} bytes)`);
      }
      return result;
    }
  },
  create_pdf: {
    schema: createPdfSchema,
    execute: createPdf,
    requiresConfirmation: true,
    format: (result) => {
      if (result.status === 'error') {
        logger.error(` ❌ Error creating PDF ${result.outputPath}`);
      } else {
        logger.success(` Created PDF: ${result.outputPath} (${result.size} bytes)`);
      }
      return result;
    }
  },
  get_website_content: {
    schema: getWebsiteContentSchema,
    execute: getWebsiteContent,
    format: (result) => {
      logger.success(` Got content from ${result.url}: (${result.chunkIndex + 1}/${result.totalChunks} chunks)`);
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
        logger.success(` Command executed successfully: \n ${result.stdout}`);
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
        message: `Do you want to execute ${toolName}${['create_file', 'update_file', 'create_pdf'].includes(toolName) ? '' : ` with arguments: ${JSON.stringify(args)}`}?`,
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
    const rawResult = await tool.execute(args);
    const result = tool.format(rawResult);
    return `** ${toolName} USER OUTPUT: ${JSON.stringify(result)} **`;
  } catch (error) {
    logger.error(`Tool error: ${JSON.stringify(error)}`);
    return `** ${toolName} USER ERROR: ${JSON.stringify(error ||error.error || error.message)} **`;
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
