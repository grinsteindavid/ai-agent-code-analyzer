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

 Goal: Provide an overview of the codebase structure and key files.

Steps:
1. Use the 'list_directories' tool to list all directories in the current working directory.
2. Use the 'find_files' tool to find all JavaScript files in the 'src' directory.
3. Use the 'read_file_content' tool to read the 'README.md' file for documentation.
4. Use the 'grep_search' tool to search for key terms in 'package.json' related to dependencies. 


 ** Tool: list_directories
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer","options":""}

-- Matches: 5

 ** Tool: find_files
Arguments: {"pattern":"*.js","path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","options":"","type":"f"}

-- Matches: 14

 ** Tool: read_file_content
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md","encoding":"utf-8"}


 ** Tool: grep_search
Arguments: {"SearchDirectory":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer","Query":"dependencies","Includes":["package.json"],"MatchPerLine":false,"CaseInsensitive":true}

-- Matches: 89

 Generating summary... 

### Summary of Results

1. **Execution Steps Overview**:
   - The execution plan was successfully carried out: directories were listed, JavaScript files in the `src` directory were identified, the README.md documentation was read, and a search for dependencies in `package.json` was performed.

2. **Findings**:
   - **Directories and Files**:
     - The root of the codebase contains important files and directories:
       - **Files**: 
         - `README.md`: Contains an overview and installation instructions for the Autonomous Code Analyzer.
         - `package.json` and `package-lock.json`: Manage project dependencies.
         - `node_modules`: Directory for installed packages.
         - `src`: Contains 13 JavaScript files focused on tools and OpenAI interactions.
   
   - **JavaScript Files Found**:
     - Key tools in `src/tools/` include:
       - `findFiles.js`, `executeLs.js`, `readFile.js`, `searchGrep.js`, and `createFile.js`.
     - Providers related to OpenAI functionalities include:
       - `index.js`, `openai/index.js`, etc.

   - **Documentation Insights**:
     - The README.md presents the tool as a Node.js application for querying codebases using natural language, leveraging OpenAI's API.

   - **Dependency Insights**:
     - A search in `package.json` and within the `node_modules` directory indicated multiple dependencies and devDependencies related to various packages, including:
       - OpenAI client library, and other utilities like `commander`, `dotenv`, etc.

3. **Key Observations**:
   - The structure supports robust functionalities for interacting with codebases through AI.
   - The lack of inline comments in the JavaScript files suggests a need for improvement in documentation (notably, no comments were found).

### Conclusion
The Autonomous Code Analyzer is well-organized, with its main feature focusing on facilitating inquiries about codebases using natural language. However, while functionality is robust, improvements in code documentation and comments would enhance maintainability and readability. The project relies on various dependencies for its operations, indicating a standard practice of managing software requirements in Node.js.
```
