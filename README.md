# Autonomous Code Analyzer: AI-Powered Codebase Intelligence

An advanced command-line tool that leverages the power of AI models like OpenAI's GPT-4 to analyze and interact with your codebase through natural language. Go beyond simple code analysis with intelligent search, web research capabilities, and file operations - all from your terminal.

## Features

- **Natural Language Understanding**: Ask questions about your codebase in plain English
- **Intelligent Codebase Analysis**: Get insights about your code structure, patterns, and organization
- **Web Research Integration**: Search the web directly from your terminal with DuckDuckGo Lite
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

## Usage

```bash
# Basic usage - ask a question about your codebase
node src/index.js analyze -q "explain codebase"

# Specify AI provider (default: openai)
node src/index.js analyze --query "What files are in src folder?" --provider openai

# Read file contents
node src/index.js analyze --query "read this file package.json"

# Perform web searches and generate structured output
node src/index.js analyze --query "do a web search for top 5 social medias and create a json with that info"

# Find specific patterns in your code
node src/index.js analyze --query "find all files that import axios"

# Get insights about your codebase architecture
node src/index.js analyze --query "explain the directory structure and key components"

# Create documentation based on your code
node src/index.js analyze --query "generate documentation for the tools directory"
```

## Options
- `-q, --query <query>`: Question or instruction about your codebase (required)
- `-p, --provider <provider>`: AI provider to use (default: openai)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

## Tool Capabilities

### Codebase Navigation
- **list_directories**: Browse your file system and find directories
- **find_files**: Locate files matching specified patterns
- **read_file_content**: View the contents of any file

### Code Analysis
- **grep_search**: Search for specific patterns across your codebase

### Web Integration
- **web_search**: Perform web searches directly from your terminal using DuckDuckGo Lite

### File Operations
- **create_file**: Generate new files with specified content

## Example Output

```bash
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

```bash
node src/index.js analyze -q "do a web search for top 5 socialmedias and create a json with that info"

Generating plan...

 Goal: Perform a web search for the top 5 social media platforms and create a JSON file with that information.

Steps:
1. Use the 'web_search' tool to find the top 5 social media platforms.
2. Use the 'create_file' tool to create a JSON file with the search results. 


 ** Tool: web_search
Arguments: {"query":"top 5 social media platforms","maxResults":5}

-- Results: 5

 ** Tool: create_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/social_media_platforms.json","content":"[{\"title\":\"List of social platforms with at least 100 million active users\",\"url\":\"https://en.wikipedia.org/wiki/List_of_social_platforms_with_at_least_100_million_active_users\",\"description\":\"Meta Platforms United States: 2009 2 billion [3] Had 1 billion daily active users when it had 1.3 billion monthly active users [citation needed] Instagram: Meta Platforms United States: 2010 2 billion [4] 4 TikTok: ByteDance China: 2016 1.582 billion [3] 5 WeChat: Tencent China: 2011 1.343 billion [3] 6 Messenger: Meta Platforms United States ...\",\"displayUrl\":\"en.wikipedia.org/wiki/List_of_social_platforms_with_at_least_100_million_active_users\"},{\"title\":\"Biggest social media platforms by users 2024 | Statista\",\"url\":\"https://www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/\",\"description\":\"Social media platforms with the highest ROI for marketers worldwide 2024; ... Top social media sites in the Nordics 2016; Number of users of social networks for professionals in China 2012;\",\"displayUrl\":\"www.statista.com/statistics/272014/global-social-networks-ranked-by-number-of-users/\"},{\"title\":\"The Top 10 Social Media Sites & Platforms - Search Engine Journal\",\"url\":\"https://www.searchenginejournal.com/social-media/social-media-platforms/\",\"description\":\"Social media is integral to our daily lives.. With 5.17 billion social media users worldwide - accounting for 59.9% of the global population - social platforms have become necessary hubs for ...\",\"displayUrl\":\"www.searchenginejournal.com/social-media/social-media-platforms/\"},{\"title\":\"The 15 Best Social Media Sites (& Platforms) in 2024 - Smart Blogger\",\"url\":\"https://smartblogger.com/social-media-sites/\",\"description\":\"Find out which social media platforms are the most popular and effective for your business, brand, or blog in 2024. Compare features, audiences, and tips for Facebook, YouTube, WhatsApp, Messenger, and more.\",\"displayUrl\":\"smartblogger.com/social-media-sites/\"},{\"title\":\"Top 35 Social Media Platforms (September 2024) - Exploding Topics\",\"url\":\"https://explodingtopics.com/blog/top-social-media-platforms\",\"description\":\"Next, here are a few of the top social networks experiencing increased growth right now. 1. Telegram. 5-year search growth: 367% Search growth status: Exploding Monthly Google Searches: 30.4 million (See the latest traffic data for telegram.org) Description: Telegram is a freemium instant messaging application that prioritizes security and encryption. . The cloud-based platform allows users to ...\",\"displayUrl\":\"explodingtopics.com/blog/top-social-media-platforms\"}]"}

-- File created successfully at /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/social_media_platforms.json

 Generating summary... 

The execution plan aimed to perform a web search for the top 5 social media platforms and create a JSON file with that information. 

1. **Web Search Execution**: The `web_search` tool successfully retrieved data about popular social media platforms from multiple sources, including Wikipedia, Statista, Search Engine Journal, Smart Blogger, and Exploding Topics. The results included key platforms such as Meta (Facebook), Instagram, TikTok, WeChat, and others, along with relevant statistics and descriptions. 

2. **File Creation Execution**: The `create_file` tool was then utilized to write the search results into a JSON file. This operation was completed successfully, with the JSON file created at the specified path.

**Summary**: The top 5 social media platforms were identified and successfully documented in a JSON file. The file is accessible at the specified path, containing detailed information about each platform.

**Top 5 Social Media Platforms**:
1. **Facebook** - 2 billion users (Meta Platforms, 2009)
2. **Instagram** - 2 billion users (Meta Platforms, 2010)
3. **TikTok** - 1.582 billion users (ByteDance, 2016)
4. **WeChat** - 1.343 billion users (Tencent, 2011)
5. **Messenger** - (Meta Platforms) 

For the complete data in JSON format, please refer to the generated file.
```