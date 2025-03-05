const { spawn } = require('child_process');

/**
 * JSON Schema for git_apply function parameters.
 */
const gitApplySchema = {
  type: "object",
  properties: {
    patchContent: {
      type: "string",
      description: "The file content that will be passed to git apply as stdin."
    }
  },
  required: ["patchContent"],
  additionalProperties: false,
  description: "Uses git apply with provided content to make file content changes."
};

/**
 * Applies a git patch to a repository using the provided patch content directly via stdin.
 *
 * @param {string} patchContent - The content of the git patch to apply.
 * @returns {Promise<Object>} A promise that resolves to an object with success status and output.
 */
async function gitApply(patchContent) {
  return new Promise((resolve, reject) => {
      
    // Start git apply process with stdin pipe
    const gitProcess = spawn('git', ['apply'], { 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    let stdout = '';
    let stderr = '';
    
    // Collect stdout
    gitProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Collect stderr
    gitProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Handle process completion
    gitProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(stderr || `Process exited with code ${code}`);
      }
      
      resolve({
        success: true,
        output: stdout,
        command: `git apply`
      });
    });
    
    // Handle any process error
    gitProcess.on('error', (error) => {
      reject(error.message || 'Failed to start git apply process');
    });
    
    // Write patch data to stdin and close the stream
    gitProcess.stdin.write(patchContent);
    gitProcess.stdin.end();
  });
}

module.exports = {
  gitApply,
  gitApplySchema
};
