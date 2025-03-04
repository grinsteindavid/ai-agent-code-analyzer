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

node src/index.js analyze --query "do a web search for top 5 social medias and create a json with that info"
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

 Goal: Provide an overview of the codebase structure and key components.

Steps:
1. Use the 'list_directories' tool to list directories in the current working directory.
2. Use the 'find_files' tool to locate all JavaScript files in the 'src' directory.
3. Use the 'read_file_content' tool to read the 'README.md' file for documentation and description of the codebase.
4. Use the 'grep_search' tool to search for keywords like 'export', 'import', and 'module' in JavaScript files to understand module usage.
5. Use the 'read_file_content' tool to read the 'package.json' file for information about dependencies and scripts used in the codebase. 


 ** Tool: list_directories
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer","options":""}

-- Matches: 5

 ** Tool: find_files
Arguments: {"pattern":"*.js","dirPath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","options":"","type":"f"}

-- Matches: 14

 ** Tool: read_file_content
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md","encoding":"utf-8"}


 ** Tool: grep_search
Arguments: {"SearchDirectory":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","Query":"export","Includes":["**/*.js"],"MatchPerLine":false,"CaseInsensitive":true}

-- Matches: 14

 ** Tool: grep_search
Arguments: {"SearchDirectory":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","Query":"import","Includes":["**/*.js"],"MatchPerLine":false,"CaseInsensitive":true}

-- Matches: 4

 ** Tool: grep_search
Arguments: {"SearchDirectory":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","Query":"module","Includes":["**/*.js"],"MatchPerLine":false,"CaseInsensitive":true}

-- Matches: 13

 ** Tool: read_file_content
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/package.json","encoding":"utf-8"}


 Generating summary... 

**Summary of Results:**

The execution plan to analyze the codebase for the Autonomous Code Analyzer was successfully carried out through a series of systematic steps including directory listing, file searching, and content reading. Here’s a synthesis of what was found:

1. **Directory and File Structure:**
   - The main directory contains essential files:
     - `README.md`: Provides an overview and installation guide.
     - `package.json`: Contains metadata, dependencies, and project scripts.
     - `node_modules`: Source for installed packages.
     - `src`: Includes multiple JavaScript files with the core functionality.

2. **JavaScript Files Identified:**
   - Total of 13 JavaScript files located in the `src` directory, notably:
     - Tools (e.g., `createFile.js`, `executeLs.js`, `findFiles.js`)
     - Provider files for OpenAI interaction (e.g., `getFunctionCall.js`, `getPlan.js`)

3. **Documentation Insights:**
   - The `README.md` elaborates on how to clone, install, and use the project. This application serves to analyze a codebase using natural language queries to fetch code information.

4. **Module Insights:**
   - JavaScript file analyses show usage of `module.exports` to expose functionalities, confirming module-based organization.
   - Searches for `export` and `import` indicate that ES module syntax is not utilized; instead, CommonJS syntax predominates with `module.exports`.

5. **Dependencies from `package.json`:**
   - Key dependencies include:
     - `commander`: Command-line framework, likely for query handling.
     - `dotenv`: For managing environment variables.
     - `openai`: The key dependency for utilizing OpenAI’s API.
   - Dev dependencies like `prettier` indicate a focus on code formatting.

**Conclusion:**
The Autonomous Code Analyzer project is structured to facilitate natural language inquiries regarding codebases, utilizing OpenAI's capabilities. It adheres to a modular architecture, although further inline documentation could enhance the maintainability of the JavaScript code. Notably, it is positioned as an AI-enhanced tool in the code analysis space.
```
