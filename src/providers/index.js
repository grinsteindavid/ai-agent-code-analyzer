/**
 * Providers index - exports all available AI providers
 */
const openaiProvider = require('./openai');
const geminiProvider = require('./gemini');

// Dictionary of available providers
const providers = {
  openai: openaiProvider,
  gemini: geminiProvider,
  // Add other providers here as needed
};

module.exports = {
  providers,
};
