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
node src/index.js analyze -q "explain my codebase"
Generating plan...

 Goal: Analyze the codebase to provide an overview of its structure and components.

Steps:
1. Use the 'list_directories' tool to list directories in the current codebase.
2. Use the 'find_files' tool to locate all JavaScript files in the 'src' directory.
3. Use the 'read_file_content' tool to read the README.md file for initial documentation and insights about the codebase.
4. Use the 'grep_search' tool to search for comments within the JavaScript files to gather insights about functionality and design. 


 ** Tool: list_directories
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer","options":"-l"}

-- Matches: 6

 ** Tool: find_files
Arguments: {"pattern":"*.js","path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","options":"","type":"f"}

-- Matches: 13

 ** Tool: read_file_content
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md","encoding":"utf-8"}


 ** Tool: grep_search
Arguments: {"pattern":"function\\s+\\w+|\\/\\/.*|\\/\\*.*?\\*\\/","path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","options":"-r"}

-- Matches: 0

 Generating summary... 

### Summary of Results

1. **Execution Steps Overview**:
   - The execution plan successfully listed the directories in the codebase, located JavaScript files in the `src` directory, read the README.md for documentation, and attempted to search for comments in the JavaScript files.

2. **Findings**:
   - **Directories**: The main visible directories and files in the root were:
     - **Files**:
       - `README.md`: Contains documentation on how to install and use the Autonomous Code Analyzer, highlighting its features and installation steps.
       - `package.json` and `package-lock.json`: Standard files for Node.js projects managing dependencies.
       - `node_modules`: Contains installed dependencies.
       - `src`: Directory housing the source code containing JavaScript files.
   - **JavaScript Files Identified**:
     - Tools: 
       - `findFiles.js`, `executeLs.js`, `readFile.js`, `searchGrep.js`
     - Providers:
       - `index.js`, `openai/index.js`, and other OpenAI related functions.
   - **README Insights**: Describes the tool as a Node.js application that allows users to query codebases using natural language and interact with APIs like OpenAI's GPT-4.

3. **Functional Analysis**:
   - Tools identified involve file operations, execution of commands, and interaction with various providers (e.g., OpenAI).
   - Key operations include searching files, reading file contents, and executing commands, which suggests a command-line utility capability.

4. **Key Observations**:
   - No comments or function definitions were found in the JavaScript files, indicating potentially sparse documentation that might undermine code readability and maintainability.

### Conclusion

The codebase for the Autonomous Code Analyzer is organized into directories containing tools and providers, specifically aimed at managing files and facilitating interactions with AI through OpenAI's API. However, the lack of comments and documentation within the code signifies a need for improvement, as this could enhance the clarity and maintainability of the system. Overall, while the structure is functional and supports robust operations, enhancements in documentation are recommended to aid future development and usability.
```
