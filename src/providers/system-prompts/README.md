# System Prompts

This directory contains the system prompts used by the Gemini API implementation.

## Files

- `summary.js` - System prompt for generating summaries
- `next-thought.js` - System prompt for generating the next thought
- `function-call.js` - System prompt for handling function calls
- `plan.js` - System prompt for generating execution plans
- `index.js` - Exports all system prompts

## Usage

```javascript
const { getSummaryPrompt } = require('./system-prompts');

// Use the prompt in your code
const systemPrompt = getSummaryPrompt(maxTokens);
```

## Updating Prompts

When updating a prompt, make sure to test it thoroughly to ensure it works as expected.
