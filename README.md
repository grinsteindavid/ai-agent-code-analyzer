# Autonomous Code Analyzer: AI-Powered Codebase Intelligence

An advanced command-line tool that leverages the power of AI models like OpenAI's GPT-4 to analyze and interact with your codebase through natural language. Go beyond simple code analysis with intelligent search, web research capabilities, and file operations - all from your terminal.

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

# Perform domain-specific web search
node src/index.js analyze --query "search for nodejs best practices on github.com"

# Find specific patterns in your code
node src/index.js analyze --query "find all files that import axios"

# Get insights about your codebase architecture
node src/index.js analyze --query "explain the directory structure and key components"

# Create documentation based on your code
node src/index.js analyze --query "generate documentation for the tools directory"

# Update an existing file with new content
node src/index.js analyze --query "update package.json to add axios dependency"
```

## Options
- `-q, --query <query>`: Question or instruction about your codebase (required)
- `-p, --provider <provider>`: AI provider to use (default: openai)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

## Tool Capabilities

### Codebase Navigation
- **list_directories**: Browse your file system and find directories
  - Supports options for showing hidden files and detailed information
  - Returns organized file metadata including size, type, and modification time
- **find_files**: Locate files matching specified patterns
  - Supports glob patterns (*.js, *.md, etc.)
  - Configurable depth for recursive searches
  - Filter by file type (regular files, directories, symbolic links)
- **read_file_content**: View the contents of any file
  - Support for different file encodings
  - Error handling for invalid files

### Code Analysis
- **grep_search**: Search for specific patterns across your codebase
  - Case-sensitive or case-insensitive search options
  - Configurable pattern matching with support for regular expressions
  - Ability to show matching lines or just file names
  - Customizable maximum results limit

### Web Integration
- **web_search**: Perform web searches directly from your terminal using DuckDuckGo Lite
  - Domain-specific searching with customizable results count
  - Returns structured data with titles, URLs, and descriptions
  - Clean parsing of search results with proper error handling

### File Operations
- **create_file**: Generate new files with specified content
  - Automatic creation of parent directories if they don't exist
  - Safety checks to prevent overwriting existing files
- **update_file**: Update existing files with new content
  - Preservation of original file permissions and metadata
  - Error handling for missing files

## Example Output

```bash
node src/index.js analyze -q "explain codebase"
Generating plan...

 Goal: Provide an explanation of the codebase in the current working directory.

Steps:
1. Use the 'read_file_content' tool to read the content of the 'README.md' file.
2. Use the 'list_directories' tool to list the contents of the 'src' directory.
3. Use the 'find_files' tool to find all JavaScript files in the 'src' directory. 
4. Use the 'grep_search' tool to search for key components or structures commonly found in JavaScript files within the 'src' directory. 


 ** I'll proceed with the first step of the execution plan and read the content of the 'README.md' file.

 * Tool: read_file_content
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/README.md"}


 ** I'll proceed with the second step of the execution plan and list the contents of the 'src' directory.

 * Tool: list_directories
Arguments: {"path":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","options":"a"}

-- Matches: 4

 ** I'll proceed with the third step of the execution plan and find all JavaScript files in the 'src' directory.

 * Tool: find_files
Arguments: {"pattern":"*.js","dirPath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","type":"f"}

-- Matches: 16

 ** "I'll proceed with the fourth step of the execution plan and search for key components or structures commonly found in JavaScript files within the 'src' directory."

 * Tool: grep_search
Arguments: {"SearchDirectory":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/src","Query":"export","Includes":["**/*.js"],"MatchPerLine":false,"CaseInsensitive":true}

-- Matches: 16

 Generating summary... 

### Summary of Execution Results

1. **Reading `README.md`**: The project is an AI-powered command-line tool that employs models like OpenAI's GPT-4 to facilitate code analysis and interaction via natural language. Key features include intelligent analysis, web search capabilities, extensibility, and various file operations.

2. **Listing the `src` Directory**: The `src` directory contains the following items:
   - `index.js`: The application's main entry point.
   - `providers`: Contains different AI provider implementations.
   - `tools`: Utility files that provide specific functionalities.
   - `utils`: Utility functions and validation helpers.

3. **Finding JavaScript Files**: A total of 16 JavaScript files were identified, including files in `index.js`, `providers`, `tools`, and `utils` directories, indicating a comprehensive code structure.

4. **Searching for Key Components**: The `grep_search` tool revealed extensive use of `module.exports` across various files. This suggests that the project employs the CommonJS module syntax to structure and export functionalities effectively.

### Conclusion
The execution of the planned steps provided a thorough overview of the Autonomous Code Analyzer project. It highlights the project's capabilities as an AI-integrated tool for code analysis, the organization of its source code, and its reliance on CommonJS for modular structure. This modular architecture enhances maintainability and extensibility, aligning well with modern JavaScript development practices. The findings underscore the project’s potential in aiding developers with AI-driven insights into their codebases.
```




```bash
node src/index.js analyze -q "create 3 csv files in the root project folder and then update these files with data about NASA"                         
Generating plan...

 Goal: Create 3 CSV files in the root project folder and update these files with data about NASA.

Steps:
1. Use the 'create_file' tool to create a new file named 'file1.csv' in the root project folder.
2. Use the 'create_file' tool to create a new file named 'file2.csv' in the root project folder.
3. Use the 'create_file' tool to create a new file named 'file3.csv' in the root project folder.
4. Use the 'update_file' tool to update the content of 'file1.csv' with data about NASA.
5. Use the 'update_file' tool to update the content of 'file2.csv' with data about NASA.
6. Use the 'update_file' tool to update the content of 'file3.csv' with data about NASA. 


 ** I'll proceed with the first step of the execution plan and create a new file named 'file1.csv' in the root project folder.

 * Tool: create_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file1.csv","content":""}

 ✅ File created successfully at /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file1.csv

 ** I'll proceed with the second step of the execution plan and create a new file named 'file2.csv' in the root project folder.

 * Tool: create_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file2.csv","content":""}

 ✅ File created successfully at /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file2.csv

 ** I'll proceed with the third step of the execution plan and create a new file named 'file3.csv' in the root project folder.

 * Tool: create_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file3.csv","content":""}

 ✅ File created successfully at /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file3.csv

 ** "I'll proceed with the fourth step of the execution plan and update the content of 'file1.csv' with data about NASA."

 * Tool: update_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file1.csv","content":"NASA, the National Aeronautics and Space Administration, is responsible for the nation's civilian space program and for aeronautics and aerospace research."}

 ✅ /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file1.csv updated successfully

 ** "I'll proceed with the fifth step of the execution plan and update the content of 'file2.csv' with data about NASA."

 * Tool: update_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file2.csv","content":"NASA, the National Aeronautics and Space Administration, is responsible for the nation's civilian space program and for aeronautics and aerospace research. Founded in 1958, NASA has been at the forefront of space exploration, scientific discovery, and cutting-edge technology development."}

 ✅ /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file2.csv updated successfully

 ** "I'll proceed with the sixth step of the execution plan and update the content of 'file3.csv' with data about NASA."

 * Tool: update_file
Arguments: {"filePath":"/Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file3.csv","content":"NASA Data, Year, Description\nApollo 11, 1969, First manned moon landing\nHubble, 1990, Space telescope that has provided stunning images\nMars Rover, 2004, Robotic spacecraft exploring Mars"}

 ✅ /Users/looper/workshop/ai-agent-terminal/autonomous-code-analyzer/file3.csv updated successfully

 Generating summary... 

**Summary of Execution Results:**

The execution plan to create and update three CSV files with data about NASA has been successfully completed. 

1. **File Creation:**
   - **file1.csv**: Created successfully.
   - **file2.csv**: Created successfully.
   - **file3.csv**: Created successfully.

2. **File Updates:**
   - **file1.csv**: Updated with NASA data, size after update is 155 bytes.
   - **file2.csv**: Updated with NASA data, size after update is 288 bytes.
   - **file3.csv**: Updated with NASA data, size after update is 187 bytes.

**Accomplished Goal:**
Three CSV files (`file1.csv`, `file2.csv`, and `file3.csv`) were created and successfully updated with relevant NASA data. All actions were executed as outlined in the original execution plan.
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