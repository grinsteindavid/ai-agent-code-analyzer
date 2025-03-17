const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

// JSON Schema Definition
const createPdfSchema = {
  type: 'object',
  required: ['outputPath', 'content', 'format', 'margin', 'printBackground'],
  additionalProperties: false,
  properties: {
    outputPath: { type: 'string', description: 'Absolute path where the PDF file should be saved.' },
    content: { type: 'string', description: 'PDF Content.' },
    format: { type: 'string', enum: ['A4', 'Letter', 'Legal', 'Tabloid'], description: 'Page format.' },
    margin: { type: 'string', description: 'Page margins (e.g., "20mm")' },
    printBackground: { type: 'boolean', description: 'Print background graphics.'}
  },
  description: 'Creates a PDF file.'
};

/**
 * Converts Markdown content to PDF and saves it to a file
 * @param {Object} args - Arguments object
 * @param {string} args.outputPath - Path where the PDF file should be saved
 * @param {string} args.content - Markdown content to convert to PDF
 * @param {string} [args.format] - Page format (e.g., "A4", "Letter")
 * @param {string} [args.margin] - Page margins (e.g., "20mm")
 * @param {boolean} [args.printBackground] - Print background graphics
 * @returns {Promise<Object>} Result object with status and path
 */
function createPdf(args) {
  const { 
    outputPath, 
    content, 
    format = 'A4', 
    margin = '20mm', 
    printBackground = false 
  } = args;
  
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
        paperFormat: format,
        paperBorder: margin,
        printBackground: printBackground
      };
      
      // Convert Markdown to PDF
      markdownpdf(pdfOptions)
        .from.string(content)
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
