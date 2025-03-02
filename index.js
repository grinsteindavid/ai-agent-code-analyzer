#!/usr/bin/env node

/**
 * Main entry point for the application
 * This file simply imports and runs the main function from src/index.js
 */

// Import the main function from the src directory
const { main } = require('./src/index');

// Run the main function
main();
