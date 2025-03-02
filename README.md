# Autonomous Code Analyzer

A Node.js tool that uses OpenAI's GPT-4 to intelligently analyze codebases based on natural language questions. The AI automatically determines relevant grep patterns to find and analyze code related to your questions.

## Features

- Ask natural language questions about your codebase
- AI automatically determines appropriate grep patterns to search for relevant code
- Intelligent file selection and analysis
- Comprehensive summaries with specific code references
- Language-aware analysis with support for multiple file extensions
- Modular, maintainable code structure

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
   chmod +x index.js
   ```

## Usage

```bash
# Ask a question about your codebase
node index.js --query "How does the authentication system work?"

# Analyze a specific directory
node index.js --directory ./my-project --query "What's the data flow in the application?"

# Specify file extensions to analyze
node index.js --query "How are API calls handled?" --extensions js,ts,jsx,tsx

# Set maximum tokens in the GPT-4 response
node index.js --query "Explain the architecture" --max-tokens 2000
```

## Options

- `-d, --directory <path>`: Directory to analyze (default: current directory)
- `-e, --extensions <exts>`: File extensions to analyze, comma-separated (default: js,jsx,ts,tsx,py,java,c,cpp,go,rb)
- `-q, --query <query>`: Question about your codebase (required)
- `-m, --max-tokens <number>`: Maximum tokens in the GPT-4 response (default: 4000)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

## Project Structure

The codebase has been refactored into a modular structure:

```
autonomous-code-analyzer/
├── index.js            # Main entry point
├── src/
│   ├── index.js        # Core application logic
│   ├── cli/
│   │   └── program.js  # CLI configuration 
│   ├── services/
│   │   ├── openai.js   # OpenAI API integration
│   │   ├── grep.js     # Grep search functionality
│   │   └── file.js     # File handling utilities
│   └── utils/
│       └── logger.js   # Logging utilities
├── package.json
└── .env
```

## How It Works

1. Takes your natural language question about the codebase
2. Uses GPT-4 to generate relevant grep search patterns
3. Searches the codebase using these patterns to identify important files
4. Extracts relevant code chunks from the most promising files
5. Sends these code samples to GPT-4 along with grep results for analysis
6. Returns a detailed analysis answering your question

## Modules

### CLI (src/cli/program.js)
Configures the command-line interface using Commander.js

### OpenAI Service (src/services/openai.js)
Handles OpenAI API interactions, including pattern generation and code analysis

### Grep Service (src/services/grep.js)
Provides utilities for searching files using grep and ranking results

### File Service (src/services/file.js)
Handles file operations including finding files and extracting code chunks

### Logger (src/utils/logger.js)
Provides consistent logging throughout the application

## License

MIT
