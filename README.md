# Autonomous Code Analyzer

A simple Node.js tool that uses OpenAI's GPT-4 to intelligently analyze codebases based on natural language questions. The AI automatically determines relevant grep patterns to find and analyze code related to your questions.

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
   chmod +x index.js
   ```

## Usage

```bash
# Basic usage - ask a question about your codebase
node index.js --query "How does the authentication system work?"
```

## Options
- `-q, --query <query>`: Question about your codebase (required)
- `-m, --max-tokens <number>`: Maximum tokens in the GPT-4 response (default: 4000)
- `-h, --help`: Display help information
- `-V, --version`: Display version information
