const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

// JSON Schema Definition
const createPdfSchema = {
  type: 'object',
  required: ['outputPath', 'markdownContent', 'options'],
  additionalProperties: false,
  properties: {
    outputPath: { type: 'string', description: 'Absolute path where the PDF file should be saved' },
    markdownContent: { type: 'string', description: 'Markdown content to convert to PDF' },
    options: {
      type: 'object',
      description: 'Optional configuration for PDF generation',
      required: ['stylesheet', 'pdf_options'],
      additionalProperties: false,
      properties: {
        stylesheet: { type: 'string', description: 'Custom CSS stylesheet URL or path' },
        pdf_options: {
          type: 'object',
          description: 'PDF output options',
          additionalProperties: false,
          required: ['format', 'margin', 'printBackground'],
          properties: {
            format: { type: 'string', description: 'Page format (e.g., "A4", "Letter")' },
            margin: { type: 'string', description: 'Page margins (e.g., "20mm")' },
            printBackground: { type: 'boolean', description: 'Print background graphics' }
          }
        }
      }
    }
  },
  description: 'Converts Markdown content to PDF and saves it to the specified path, .'
};

/**
 * Converts Markdown content to PDF and saves it to a file
 * @param {Object} args - Arguments object
 * @param {string} args.outputPath - Path where the PDF file should be saved
 * @param {string} args.markdownContent - Markdown content to convert to PDF
 * @param {Object} [args.options] - Optional configuration for PDF generation
 * @returns {Promise<Object>} Result object with status and path
 */
function createPdf(args) {
  const { outputPath, markdownContent, options = {} } = args;
  
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure the directory exists
      const directory = path.dirname(outputPath);
      
      // Create directory recursively if it doesn't exist
      if (!fs.existsSync(directory)) {
        return reject({
          status: 'error',
          outputPath,
          message: `Directory does not exist at ${directory}. Skipping creation.`
        });
      }
      
      // Check if file already exists
      if (fs.existsSync(outputPath)) {
        return reject({
          status: 'error',
          outputPath,
          message: `File already exists at ${outputPath}. Skipping creation.`
        });
      }
      
      // Configure PDF generation options
      const pdfOptions = {
        dest: outputPath,
        ...options
      };
      
      // Convert Markdown to PDF
      const pdf = await mdToPdf({ content: markdownContent }, pdfOptions);
      
      if (pdf) {
        resolve({
          status: 'success',
          outputPath,
          message: `PDF created successfully at ${outputPath}`,
          size: pdf.content.length
        });
      } else {
        reject({
          status: 'error',
          outputPath,
          message: 'Failed to generate PDF'
        });
      }
    } catch (error) {
      reject({
        status: 'error',
        outputPath,
        message: error.message || 'An error occurred while creating the PDF'
      });
    }
  });
}

module.exports = {
  createPdf,
  createPdfSchema
};
