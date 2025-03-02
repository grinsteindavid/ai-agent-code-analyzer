To implement this project:

1. Set up the project folder and files as described above
2. Run `npm install` to install dependencies
3. Create `.env` file with your actual openai API key
4. Make the index.js file executable with `chmod +x index.js` 
5. Run the tool with `node index.js` followed by your desired options

This application will:
- Use glob patterns to find relevant code files
- Use grep to search for specific patterns in code
- Analyze code samples and grep results in chunks of 100 lines
- Send code samples and grep results to OpenAI GPT-4
- Return AI-powered analysis of the codebase




# Autonomous Code Analyzer

A Node.js tool that uses OpenAI's GPT-4  tools to intelligently analyze codebases based on natural language questions. The AI automatically determines relevant grep patterns to find and analyze code related to your questions.

## Features

- Ask natural language questions about your codebase
- AI automatically determines appropriate grep patterns to search for relevant code
- Intelligent file selection and analysis
- Comprehensive summaries with specific code references
- Language-aware analysis with support for multiple file extensions

## Setup CLI options
```javascript
program
  .name('claude-code-analyzer')
  .description('AI-powered code analyzer using OpenAI GPT-4 with autonomous grep pattern selection')
  .version('1.0.0')
  .option('-d, --directory <path>', 'Directory to analyze', '.')
  .option('-e, --extensions <exts>', 'File extensions to analyze (comma-separated)', 'js,jsx,ts,tsx,py,java,c,cpp,go,rb')
  .option('-q, --query <query>', 'Question about your codebase')
  .option('-m, --max-tokens <number>', 'Maximum tokens in response', '4000')
  .parse(process.argv);
```


## Usage

```bash
# Ask a question about your codebase
node index.js --query "How does the authentication system work?"

# Analyze a specific directory
node index.js --directory ./my-project --query "What's the data flow in the application?"

# Specify file extensions to analyze
node index.js --query "How are API calls handled?" --extensions js,ts,jsx,tsx
```