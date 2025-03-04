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

 Goal: Provide an overview of the codebase by examining its structure and content.

Steps:
1. Use the 'list_directories' tool to list the directories in the current working directory.
2. Use the 'find_files' tool to locate all relevant files in the 'src' directory.
3. Use the 'read_file_content' tool to read the content of the 'README.md' file for documentation insights. 


 ** Tool: list_directories
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer","options":"-l"}

-- Matches: 6

 ** Tool: find_files
Arguments: {"pattern":"*","path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","type":"f"}

Error: find: f: unknown primary or operator


 ** Tool: find_files
Arguments: {"pattern":"*","path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src"}

-- Matches: 18

 ** Tool: read_file_content
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md"}


 Generating summary... 

### Summary of Execution Results

1. **Directory Listing**: The working directory contains:
   - `README.md`
   - `node_modules`
   - `package-lock.json`
   - `package.json`
   - `src` (which includes subdirectories and multiple source files)

2. **Source Files in `src` Directory**: The `src` directory includes several essential JavaScript files organized into subdirectories such as:
   - `tools`
   - `providers`
   - `utils`
   - The main entry point `index.js`

3. **Content of `README.md`**:
   - **Project Title**: Autonomous Code Analyzer
   - **Purpose**: A Node.js tool that leverages OpenAI's GPT-4 to answer natural language queries regarding the codebase.
   - **Installation**: Instructions for cloning the repository, installing dependencies, setting up the API key, and making the main script executable.
   - **Usage**: Provides command-line examples for querying the codebase.
   - **Options**: Lists available command-line options for users.

4. **Insights from `package.json`**:
   - Contains project metadata, including dependencies like `commander`, `ajv`, and `dotenv`.
   - Specifies scripts for building and running the project.

### Overview of the Codebase

The Autonomous Code Analyzer project is structured to facilitate intelligent codebase analysis via natural language queries. It includes several modules, specifically designed to manage user interactions, process queries, and validate inputs. 

- **Main Components**:
   - **Entry Point (`index.js`)**: Handles CLI interactions and query execution.
   - **Providers**: Contains specific implementations for interacting with the OpenAI API.
   - **Utilities**: Offers various helper functions that streamline operations such as file reading and command execution.

### Conclusion

In conclusion, the analysis reveals a well-structured codebase designed to simplify codebase querying through an AI interface. Key functionalities, as outlined in the `README.md`, demonstrate a clear user journey from installation to execution, making it a promising tool for developers seeking insights into their code. Further testing and potential feature enhancements are advised to maximize user experience and applicability.

If more detailed exploration or specific analysis is required on certain code files, please let me know.
```
