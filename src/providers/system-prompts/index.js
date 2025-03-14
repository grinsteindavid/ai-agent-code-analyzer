/**
 * Export all system prompts
 */

const getSummaryPrompt = require('./summary');
const getNextThoughtPrompt = require('./next-thought');
const getFunctionCallPrompt = require('./function-call');
const getPlanPrompt = require('./plan');

module.exports = {
  getSummaryPrompt,
  getNextThoughtPrompt,
  getFunctionCallPrompt,
  getPlanPrompt
};
