# Autonomous Code Analyzer: AI-Powered Codebase Intelligence

## Project Timeline

- Started: March 2, 2025
- Status: Ongoing


## Overview

The Autonomous Code Analyzer is an AI-powered CLI tool that uses OpenAI's GPT models to analyze codebases, search for specific patterns, and perform operations on files. The system follows an agent-based architecture where the AI creates a plan, executes a series of tools according to that plan, and then summarizes the findings.

## Features

- **Natural Language Understanding**: Ask questions about your codebase in plain English
- **Intelligent Codebase Analysis**: Get insights about your code structure, patterns, and organization
- **Web Research Integration**: Search the web directly from your terminal with DuckDuckGo Lite
  - Customizable search parameters including domain-specific queries
  - Structured results with titles, URLs, and descriptions
- **File Operations**: Find files, read content, and create new files - all through conversational commands
- **Pattern Search**: Use grep-like functionality through simple queries
- **Execution Planning**: Advanced AI planning capabilities to break down complex requests into manageable steps
- **Extensible Architecture**: Easy to add new tools and AI providers to enhance functionality
- **Markdown-Formatted Results**: Clean and readable output for improved developer experience

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

5. Link the package:
   ```bash
   npm link
   ```

6. Check the installation:
   ```bash
   which code-analyzer
   code-analyzer --version
   ```

## Usage

```bash
# Basic usage - ask a question about your codebase
node src/index.js analyze -q "explain codebase"

# Specify AI provider (default: openai)
code-analyzer analyze --query "What files are in src folder?" --provider openai

# Read file contents
node src/index.js analyze --query "read this file package.json"

# Perform web searches and generate structured output
code-analyzer analyze --query "do a web search for top 5 social medias and create a json with that info"

# Perform domain-specific web search
node src/index.js analyze --query "search for nodejs best practices on github.com"

# Find specific patterns in your code
node src/index.js analyze --query "find all files that import axios"

# Get insights about your codebase architecture
code-analyzer analyze --query "explain the directory structure and key components"

# Create documentation based on your code
node src/index.js analyze --query "generate documentation for the tools directory"

# Update an existing file with new content
code-analyzer analyze --query "update package.json to add axios dependency"
```

## Options
- `-q, --query <query>`: Question or instruction about your codebase (required)
- `-p, --provider <provider>`: AI provider to use (default: openai)
- `-h, --help`: Display help information
- `-V, --version`: Display version information


## System Components

### Core Components

1. **Entry Point (index.js)**
   - Initializes the CLI command structure
   - Orchestrates the overall execution flow
   - Manages the loop of function calls until completion

2. **AI Provider (OpenAI)**
   - Handles communication with OpenAI APIs
   - Implements three key functions:
     - `getPlan`: Generates an execution plan
     - `getFunctionCall`: Determines the next tool to execute
     - `getSummary`: Summarizes findings after execution

3. **Context Management (context.js)**
   - Maintains state throughout execution
   - Stores conversation history, current directory, and plan
   - Provides utility functions for state management

4. **Tools Management (tools.js)**
   - Registers available tools with their schemas and execution functions
   - Validates tool arguments against schemas
   - Handles tool execution and formatting of results

### Available Tools

1. **list_directories**: Lists files and directories in a specified path
2. **read_file_content**: Reads the content of a file
3. **grep_search**: Searches for patterns in files
4. **find_files**: Finds files matching specific patterns
5. **create_file**: Creates a new file with specified content
6. **update_file**: Updates the content of an existing file
7. **web_search**: Performs web searches using DuckDuckGo Lite

## Execution Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant CLI as CLI Interface
    participant OpenAI as OpenAI Provider
    participant Context as Context Manager
    participant Tools as Tools Manager
    participant FileSystem as File System
    participant WebAPI as Web APIs

    User->>CLI: Initiates query with 'analyze' command
    CLI->>OpenAI: Calls getPlan with user query
    OpenAI->>Tools: Retrieves current directory info
    Tools->>FileSystem: Lists directory contents
    FileSystem-->>Tools: Returns directory contents
    Tools-->>OpenAI: Returns directory structure
    OpenAI-->>CLI: Returns execution plan
    CLI->>Context: Stores plan
    
    loop Until completion
        CLI->>OpenAI: Calls getFunctionCall
        OpenAI->>Context: Retrieves plan and history
        Context-->>OpenAI: Returns plan and history
        OpenAI->>OpenAI: Generates next thought
        OpenAI->>OpenAI: Determines next function call
        OpenAI-->>CLI: Returns function call details
        CLI->>Tools: Executes specified tool
        alt File System Operation
            Tools->>FileSystem: Performs file operation
            FileSystem-->>Tools: Returns result
        else Web Search
            Tools->>WebAPI: Performs web search
            WebAPI-->>Tools: Returns search results
        end
        Tools-->>CLI: Returns formatted result
        CLI->>Context: Stores result in conversation
    end
    
    CLI->>OpenAI: Calls getSummary
    OpenAI->>Context: Retrieves complete history
    Context-->>OpenAI: Returns history
    OpenAI-->>CLI: Returns final summary
    CLI-->>User: Displays summary
```

## Prompt Structure and Tool Sequence

### 1. Plan Generation

The system starts with the `getPlan` function, which uses the following prompt structure:

- **System Prompt**: Instructs the AI to create an execution plan based on:
  - Operating system info
  - Node.js version
  - Current working directory and its contents
  - Available tools and their descriptions
- **User Message**: Contains the user's query

The response is a structured plan with a goal statement and numbered steps.

### 2. Function Call Generation

The `getFunctionCall` function uses a two-stage process:

1. **First Stage (Next Thought)**:
   - System prompt contains context about directory, available tools, and instructions to follow the plan
   - Previous messages are included for context
   - Generates a "next thought" explaining what action will be taken

2. **Second Stage (Tool Selection)**:
   - Uses the next thought as guidance
   - Selects the appropriate tool and arguments
   - Returns a structured function call object

### 3. Tool Execution

Tools are executed based on their registered functions in the tools.js file:

1. Each tool has a schema for argument validation
2. The execution function is called with the provided arguments
3. Results are formatted according to each tool's formatting function
4. Results are added to the conversation history

### 4. Summary Generation

After all steps are completed, the `getSummary` function:

- Reviews the entire conversation history
- Compares actual execution against the original plan
- Generates a concise summary of findings
- Adds the summary to the conversation history

## Special Focus: Web Search Implementation

The web search tool (`web_search`) stands out as a particularly useful feature:

- Uses DuckDuckGo Lite to avoid rate limiting issues
- Parses HTML responses with Cheerio to extract structured results
- Returns search results with titles, URLs, descriptions, and display URLs
- Can be customized with a maximum number of results parameter

## System Design Principles

1. **Modular Architecture**: Each component has a single responsibility
2. **Stateful Context**: Maintains state throughout execution
3. **Tool Abstraction**: Tools are registered with a common interface
4. **Validation**: Arguments are validated against schemas
5. **Conversation Management**: All interactions are tracked as a conversation

## Conclusion

The Autonomous Code Analyzer demonstrates an effective architecture for AI-powered CLI tools. By separating planning, execution, and summarization into distinct phases, it provides a structured approach to solving complex code analysis tasks. The use of tool abstractions allows for easy extension with new capabilities while maintaining a consistent interface for the AI to interact with.

## Example Output

```bash
ode-analyzer analyze --query "explain codebase"                    
Generating plan...

 Goal: The user wants me to provide an explanation of the codebase. To tackle this task, I will read the content of the README.md file to gather information about the project, and then I may explore the src directory for additional insights on the code structure and functionality. I will start by reading the README.md file to get an overview of the codebase. 


 ** I'll read the content of the README.md file using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md","encoding":"utf-8"}


 ** I'll now explore the `src` directory to understand its structure and main components by listing the directories and files present in it using the 'list_directories' tool.

-- Tool: list_directories
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","options":"al"}

-- Matches: 4

 ** I'll read the `src/index.js` file to understand its role as the main entry point of the codebase and how it orchestrates the CLI functionality using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/index.js"}


 ** I'll explore the contents of the `src/providers` directory to understand the available AI providers, focusing on the implementation related to OpenAI by listing the directories and files present using the 'list_directories' tool.

-- Tool: list_directories
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers","options":"a"}

-- Matches: 2

 ** I'll read the `src/providers/index.js` file to understand how the AI providers, especially OpenAI, are structured and integrated into the project using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers/index.js"}


 ** I'll explore the `src/providers/openai` directory to analyze the specific implementation of the OpenAI provider and its functionalities by listing the directories and files present using the 'list_directories' tool.

-- Tool: list_directories
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers/openai","options":"a"}

-- Matches: 5

 ** I'll read the `src/providers/openai/getPlan.js` file to understand how the plan generation function works within the OpenAI provider context using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers/openai/getPlan.js"}


 ** I'll read the `src/providers/openai/getFunctionCall.js` file to understand how the function call generation is implemented within the OpenAI provider using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers/openai/getFunctionCall.js"}


 ** I'll read the `src/providers/openai/getNextThought.js` file to understand how the system generates the next thought based on the current context in the OpenAI provider using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers/openai/getNextThought.js"}


 ** I'll read the `src/providers/openai/getSummary.js` file to see how the summary generation is handled within the OpenAI provider using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/providers/openai/getSummary.js"}


 ** I'll explore the `src/tools` directory to analyze the available tools implemented in the project and their respective functionalities by listing the directories and files present using the 'list_directories' tool.

-- Tool: list_directories
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools","options":"a"}

-- Matches: 7

 ** I'll read the `src/tools/createFile.js` file to understand how the file creation functionality is implemented in the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/createFile.js"}


 ** I'll read the `src/tools/findFiles.js` file to understand how the functionality for searching files is implemented within the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/findFiles.js"}


 ** I'll read the `src/tools/listDirectories.js` file to understand how the functionality for listing directories is implemented in the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/listDirectories.js"}


 ** I'll read the `src/tools/readFile.js` file to understand the implementation of the file reading functionality within the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/readFile.js"}


 ** I'll read the `src/tools/searchGrep.js` file to understand how the text searching functionality is implemented within the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/searchGrep.js"}


 ** I'll read the `src/tools/updateFile.js` file to understand how the functionality for updating files is implemented within the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/updateFile.js"}


 ** I'll read the `src/tools/webSearch.js` file to understand how the web searching functionality is implemented within the tools module using the 'read_file_content' tool.

-- Tool: read_file_content
-- Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src/tools/webSearch.js"}


 Generating summary... 

### Summary of Findings

The **Autonomous Code Analyzer** is an AI-powered CLI tool designed for analyzing codebases using OpenAI's models. Here are the main components and functionalities identified from the README.md file and subsequent explorations of the source code:

1. **Main Components**:
   - **Entry Point (`src/index.js`)**: Initializes the CLI and orchestrates user commands.
   - **AI Providers (`src/providers`)**: Currently supports OpenAI for execution planning, function calls, and summarization of actions taken based on user queries.
   - **Tool Set (`src/tools`)**: Contains various tools that perform functions such as file operations, pattern searching, and web searching.

2. **Key Functionalities**:
   - **Natural Language Queries**: Users can ask questions and issue commands in plain English to interact with the tool.
   - **Execution Planning**: The AI generates a structured execution plan based on user input and context.
   - **File Operations**: Supports creating, reading, updating, and finding files, along with searching content through regex-like patterns.
   - **Web Search Capability**: Integrates web searches using DuckDuckGo Lite, allowing users to find information directly from the CLI.

3. **Modular Architecture**:
   - The codebase exhibits a clear separation of concerns, with distinct modules for CLI interaction, AI processing, and functional tools, making it extensible for future development.

### Conclusion

The Autonomous Code Analyzer demonstrates an innovative architecture for AI-powered CLI tools that utilize natural language processing in conjunction with programming capabilities to enhance code analysis and developer productivity. The flexible design allows for easy integration of new features or additional AI providers, ensuring its adaptability in various development environments.
```