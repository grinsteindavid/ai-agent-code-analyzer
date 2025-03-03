/**
 * Providers index - exports all available AI providers
 */
const openaiProvider = require('./openai');

// Dictionary of available providers
const providers = {
  openai: openaiProvider,
  // Add other providers here as needed
};

module.exports = {
  providers,
};
