# Autonomous Code Analyzer

A simple Node.js tool that uses multiple providers like OpenAI's GPT-4 to intelligently analyze codebases based on natural language questions.

## Features

- Ask natural language questions about your codebase

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/autonomous-code-analyzer.git
   cd autonomous-code-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Make the script executable:
   ```bash
   chmod +x src/index.js
   ```

## Usage

```bash
# Basic usage - ask a question about your codebase
node src/index.js analyze -q "List the files in the src directory and show the contents of index.js"

node src/index.js analyze --query "What files are in src folder?" --max-tokens 2000 --provider openai

node src/index.js analyze --query "read this file package.json" --max-tokens 2000
```

## Options
- `-q, --query <query>`: Question about your codebase (required)
- `-m, --max-tokens <number>`: Maximum tokens in the AI response (default: 4000)
- `-p, --provider <provider>`: AI provider to use (default: openai)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

## Example Output

```
node src/index.js analyze -q "List the files in the src directory and show the contents of index.js"
Generating plan...

 1. Use the `ls` tool to list the files in the `src` directory.
2. Use the `readFile` tool to read the contents of the `index.js` file. 

Here is the execution plan:

1. Execute `ls` with the path set to `/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src`.
2. Execute `readFile` with the path set to `/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/index.js`.

Executing step 1...
Tool: ls
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src"}


Executing step 2...
Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/index.js"}


Executing step 3...
### Execution Summary

1. **Directory Listing**: The `ls` tool was executed successfully in the `/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src` directory. It returned the following contents:
   - Files and directories: `index.js`, `providers`, `tools`, `utils`

2. **File Reading**: The `readFile` tool was used to read the contents of the `index.js` file. The content of the file defines a command-line interface (CLI) tool for an AI-powered application, which utilizes the `commander` library. Key features of the file include:
   - Configuration of the CLI, including command setup and description.
   - An `analyze` command to allow users to query their codebase using AI.
   - Handling of input options such as query, maximum token count, and AI provider selection.
   - A structured approach to generate a plan based on user input, execute function calls in a loop until completion, and log the results at each step.

### Key Findings
- The `index.js` serves as the primary entry point for the CLI, facilitating interaction with an AI model to analyze code, leveraging various tools and utilities imported from the `utils` and `providers` directories.

### Next Steps
- Depending on the project's goals, potential next steps could include:
  - Testing the `analyze` command with various queries to validate functionality.
  - Reviewing the contents of the `providers
