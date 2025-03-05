const fs = require('fs').promises;
const Diff = require('diff');
const { execSync } = require('child_process');

/**
 * JSON Schema for git_apply function parameters.
 */
const gitApplySchema = {
  type: "object",
  properties: {
    patchContent: {
      type: "string",
      description: "The file content that will be passed to git apply as stdin."
    },
    filePath: {
      type: "string",
      description: "The path of the file to apply the patch to."
    }
  },
  required: ["patchContent", "filePath"],
  additionalProperties: false,
  description: "Uses git apply with provided content to make file content changes."
};

/**
 * Checks if git is installed on the system
 * @returns {boolean} - True if git is installed, false otherwise
 */
function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Applies a git patch to a repository using the provided patch content directly via stdin.
 *
 * @param {string} filePath - The path of the file to apply the patch to.
 * @param {string} patchContent - The content of the git patch to apply.
 * @returns {Promise<Object>} A promise that resolves to an object with success status and output.
 * @throws {Error} If git is not installed or if the patch fails to apply.
 */
async function gitApply(patchContent, filePath) {
  // Check if git is installed
  if (!isGitInstalled()) {
    throw new Error('Git is not installed on the system. Please install git to use this feature.');
  }
  
  const originalContent = await fs.readFile(filePath, 'utf8');
  const patchedContent = Diff.applyPatch(originalContent, patchContent);
  if (patchedContent === false) {
    throw new Error("Failed to apply patch. The patch might be invalid or not applicable.");
  }

  return "Git diff applied successfully.";
}

module.exports = {
  gitApply,
  gitApplySchema
};
