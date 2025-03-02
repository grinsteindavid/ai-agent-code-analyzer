const { Command } = require('commander');

/**
 * Configure and set up the CLI program
 * @returns {Command} Configured Commander program
 */
function setupProgram() {
  const program = new Command();
  program
    .name('code-analyzer')
    .description('AI-powered code analyzer using OpenAI GPT-4 with autonomous grep pattern selection')
    .version('1.0.0')
    .option('-d, --directory <path>', 'Directory to analyze', '.')
    .option('-e, --extensions <exts>', 'File extensions to analyze (comma-separated)', 'js,jsx,ts,tsx,py,java,c,cpp,go,rb')
    .option('-i, --ignore <patterns>', 'Patterns to ignore (comma-separated, e.g., node_modules,dist,*.log)', 'node_modules,dist,build,.git')
    .option('-q, --query <query>', 'Question about your codebase')
    .option('-m, --max-tokens <number>', 'Maximum tokens in response', '4000')
    .parse(process.argv);

  const options = program.opts();

  // Validate query
  if (!options.query) {
    console.error('Error: Please provide a query using the --query option');
    program.help();
  }

  return { program, options };
}

module.exports = {
  setupProgram
};
