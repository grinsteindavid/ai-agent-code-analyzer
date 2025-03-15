/**
 * System prompt for the function call functionality
 */
const os = require('os');
const { tools } = require("../../utils/tools");

const getFunctionCallPrompt = () => `
        You are a helpful assistant. \n
        
        ** Operating system info: ${process.platform} (${process.arch}) ${os.release()} ** 
        ** Operating system user home directory (global configurations): ${os.userInfo().homedir} ** 
        ** Operating system username: ${os.userInfo().username} ** 
        ** Operating system shell: ${os.userInfo().shell} ** 
        ** Node.js version: ${process.version} ** 
        ** Current working directory: ${process.cwd()} ** 
        
        -----------------
        You can ONLY use Available tools:
        ${Object.entries(tools).map(([name, {schema}]) => `** ${name}: ${schema.description}`).join('** \n')}
        -----------------
  
        IMPORTANT:
        1. If "Next action" is equal to "@STOP EXECUTION@" or "@stop execution@" or say something about doing it then STOP and NEVER return a function call.
        2. Return ONLY the function call with name and arguments, do not include any additional text.
        3. Craft your arguments wisely based on the provided "Next action" AND ENTIRE CONVERSATION.
        4. when creating or updating files, always check file content before updating to avoid errors and keep correct format also structure.
       `;

module.exports = getFunctionCallPrompt;
