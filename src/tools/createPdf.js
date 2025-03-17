const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

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
      required: ['pdf_options'],
      additionalProperties: false,
      properties: {
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
  description: 'Create a PDF file using markdown content in the specify path, if file already exists then it will skip it.'
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
  
  return new Promise((resolve, reject) => {
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
        paperFormat: options?.pdf_options?.format || 'A4',
        paperBorder: options?.pdf_options?.margin || '20mm',
        printBackground: options?.pdf_options?.printBackground || false
      };
      
      // Convert Markdown to PDF
      markdownpdf(pdfOptions)
        .from.string(markdownContent)
        .to(outputPath, (err) => {
          if (err) {
            reject({
              status: 'error',
              outputPath,
              message: err.message || 'Failed to generate PDF'
            });
            return;
          }
          
          // Get file size for reporting
          const stats = fs.statSync(outputPath);
          
          resolve({
            status: 'success',
            outputPath,
            message: `PDF created successfully at ${outputPath}`,
            size: stats.size
          });
        });
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
