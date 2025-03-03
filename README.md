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

 1. Use the 'ls' tool to list contents of the current directory to identify relevant files in the codebase.
2. Use the 'readFile' tool to read the 'README.md' file for an overview of the codebase.
3. Use the 'readFile' tool to read 'package.json' for information about project dependencies and scripts.
4. Use the 'ls' tool to list contents of the 'src' directory to find source code files.
5. Use the 'readFile' tool to read key source code files in the 'src' directory to understand the application's structure and functionality. 

** Tool: ls
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer"}

** Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md","encoding":"utf-8"}

** Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/package.json","encoding":"utf-8"}

** Tool: ls
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src"}

** Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/index.js","encoding":"utf-8"}

** Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/utils/tools.js","encoding":"utf-8"}

** Tool: readFile
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/utils/validation.js","encoding":"utf-8"}

All steps of the execution plan have been executed. No further steps are needed.
### Summary of Findings

1. **Directory Listing**:
   The working directory `/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer` contains the following files and directories:
   - `README.md`
   - `node_modules`
   - `package-lock.json`
   - `package.json`
   - `src`

2. **Content of `README.md`**:
   The `README.md` provides a detailed overview of the project, titled **Autonomous Code Analyzer**, which is designed to analyze codebases using natural language processing with OpenAI's GPT-4. Key sections include:
   - **Features**: Users can ask natural language questions about their codebase.
   - **Installation Instructions**: Steps to clone the repository, install dependencies, set up environment variables, and prepare the script for execution.
   - **Usage Examples**: Demonstrates how to query the application for codebase information.
   - **Options for Queries**: Lists available command-line options such as query specifications and available AI providers.

3. **Content of `package.json`**:
   The `package.json` file outlines the project's configuration, including its name, version, description, main entry point, scripts for execution, keywords, license, and dependencies. Key dependencies include `commander`, `ajv`, `dotenv`, `glob`, and `openai`.

4. **Source Code Structure**:
   The `src` directory includes:
   - `index.js`: The main entry point that handles command-line interactions.
   - `providers`: Potentially contains various AI interaction strategies.
   - `tools`: Includes utility functions such as `executeLs` for listing directories and `readFile` for file reading operations.
   - `utils`: Contains helper functions including schema validation logic.

5. **Key Code Insights from `index.js`**:
   The `index.js` file sets up the Command Line Interface (CLI), allowing users to inquire about their codebase with specific AI providers. It validates user input, generates plans based on queries, and executes functions accordingly.

6. **Code Execution Handling**:
   The utility `tools` module defines the available tools and their schemas, enabling the execution of commands like listing files or reading files while validating the input against predefined schemas.

### Next Steps
- **Testing**: To ensure functionality, the project can be tested using various queries to validate the responses from the AI.
- **Extending Functionality**: Evaluate the potential for additional tools or improvements in the user interaction model based on user feedback or emerging requirements.
- **Documentation**: Consider enhancing the documentation based on user operation scenarios and any additional features that may be implemented in the future.

This summary encapsulates the essential findings and insights from the exploration of the codebase, providing a clear understanding of the project's structure and functionality. Please let me know if further analysis or exploration is required.
```
