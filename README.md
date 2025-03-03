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
node src/index.js analyze -q "explain codebase"

node src/index.js analyze --query "What files are in src folder?" --provider openai

node src/index.js analyze --query "read this file package.json"
```

## Options
- `-q, --query <query>`: Question about your codebase (required)
- `-m, --max-tokens <number>`: Maximum tokens in the AI response (default: 4000)
- `-p, --provider <provider>`: AI provider to use (default: openai)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

## Example Output

```
node src/index.js analyze -q "explain codebase"
Generating plan...

 To explain the codebase, I will start by listing the files and directories in the current working directory. Then, I will review the `README.md` file, which typically contains important information about the project. 

Here’s the execution plan:

1. List the files and directories in the current working directory `/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer`.
2. Read the `README.md` file to gather information about the codebase.

Let's begin with the first step.

Executing step 1...
Tool: ls
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer"}


Executing step 2...
Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md"}


Executing step 3...
### Summary of Review on the Codebase

1. **Directory Listing**:
   The working directory `/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer` contains the following files and directories:
   - `README.md`
   - `node_modules`
   - `package-lock.json`
   - `package.json`
   - `src`

2. **Content of `README.md`**:
   The `README.md` provides a comprehensive overview of the project titled **Autonomous Code Analyzer**, a Node.js tool designed to analyze codebases using natural language questions. Key details include:
   - **Features**: Users can ask natural language questions about their codebase.
   - **Installation Instructions**: Steps to clone the repository, install dependencies, set up the environment with an OpenAI API key, and make the main script executable.
   - **Usage Examples**: Demonstrates how to use the command-line tool to execute queries regarding the codebase.
   - **Options for Queries**: Lists available command-line options like query specifications, token limits, and provider selection.

3. **Execution Summary of Commands**:
   - The `ls` command was executed to list files in the `src` directory, revealing the following files: `index.js`, `providers`, `tools`, `utils`.
   - The `readFile` command examined `index.js`, which serves as the main entry point for the CLI. It sets up the command structure and manages
```
