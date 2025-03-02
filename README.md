# Autonomous Code Analyzer

A simple Node.js tool that uses OpenAI's GPT-4 to intelligently analyze codebases based on natural language questions. The AI automatically determines relevant grep patterns to find and analyze code related to your questions.

## Features

- Ask natural language questions about your codebase
- AI automatically generates appropriate grep patterns
- Ignore specific folders or files
- Comprehensive analysis with file references and code snippets
- Support for multiple file extensions

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
# Basic usage - ask a question about your codebase
node index.js --query "How does the authentication system work?"

# Analyze a specific directory
node index.js --directory ./my-project --query "How is data validated?"

# Specify file extensions to analyze
node index.js --query "How are API calls handled?" --extensions js,ts,jsx

# Ignore specific folders or files
node index.js --query "Explain the router" --ignore node_modules,dist,test

# Combine multiple options
node index.js --directory ./src --extensions js,ts --ignore test,mocks --query "How is state managed?"
```

## Options

- `-d, --directory <path>`: Directory to analyze (default: current directory)
- `-e, --extensions <exts>`: File extensions to analyze, comma-separated (default: js,jsx,ts,tsx,py,java,c,cpp,go,rb)
- `-i, --ignore <patterns>`: Patterns to ignore, comma-separated (default: node_modules,dist,build,.git)
- `-q, --query <query>`: Question about your codebase (required)
- `-m, --max-tokens <number>`: Maximum tokens in the GPT-4 response (default: 4000)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

## How It Works

1. Takes your natural language question about the codebase
2. Uses GPT-4 to generate relevant grep search patterns
3. Searches the codebase using these patterns to identify important files
4. Extracts relevant code chunks from the most promising files
5. Sends these code samples to GPT-4 along with grep results for analysis
6. Returns a detailed analysis answering your question

## Project Structure

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

## Example Output

When you run the tool with a query like `node index.js --query "How does the error handling work?"`, you'll get an output like:

```
Starting code analysis...
Query: How does the error handling work?
Analyzing directory: .
File extensions: js,jsx,ts,tsx,py,java,c,cpp,go,rb

Step 1: Generating search patterns based on your question...
Generated search patterns: ["try.*catch", "throw", "error", "exception", "handler"]

Step 2: Searching for files with specified extensions...
Found 15 files with extensions: js,jsx,ts,tsx,py,java,c,cpp,go,rb

...

==== CODE ANALYSIS ====

## Answer
Error handling in this codebase is primarily managed through try-catch blocks...

[detailed analysis continues...]

==== END OF ANALYSIS ====
```

## License

MIT
