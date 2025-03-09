const fs = require('fs');
const pdf = require('pdf-parse');

// JSON Schema Definition
const readPdfFileSchema = {
  type: 'object',
  required: ['path', 'options'],
  additionalProperties: false,
  properties: {
    path: { type: 'string', description: 'Path of the PDF file to read' },
    options: {
      type: 'object',
      description: 'Optional configuration for PDF parsing page range',
      additionalProperties: false,
      required: ['all', 'pageFrom', 'pageTo'],
      properties: {
        all: { type: 'boolean', description: 'Extract all pages, default true' },
        pageFrom: { type: 'integer', description: 'First page to extract (1-based indexing), default to 1 pageFrom should always be same or less than pageTo' },
        pageTo: { type: 'integer', description: 'Last page to extract (1-based indexing), default to 1 pageTo should always be same or greater than pageFrom' }
      }
    }
  },
  description: 'Reads and extracts text content from a PDF file at the specified path using pdf-parse.'
};

/**
 * Reads and extracts text content from a PDF file
 * @param {string} path - Path of the PDF file to read
 * @param {Object} options - Optional configuration for PDF parsing
 * @param {number} [options.pageFrom] - First page to extract (1-based indexing)
 * @param {number} [options.pageTo] - Last page to extract (1-based indexing)
 * @returns {Promise<Object>} Result object with status and PDF content information
 */
function readPdfFile(path, options = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path)) {
      return reject({
        status: 'error',
        path: path,
        error: 'File does not exist'
      });
    }

    // Check if file is a PDF by examining its extension
    if (!path.toLowerCase().endsWith('.pdf')) {
      return reject({
        status: 'error',
        path: path,
        error: 'File is not a PDF'
      });
    }

    // Read the PDF file
    const dataBuffer = fs.readFileSync(path);
    
    // Configure pdf-parse options
    const pdfOptions = {};
    
    // Handle page range if specified
    if (options.all === false  && (options.pageFrom !== undefined || options.pageTo !== undefined)) {
      pdfOptions.pagerender = function(pageData) {
        const pageNum = pageData.pageIndex + 1; // Convert to 1-based indexing
        const pageFrom = options.pageFrom || 1;
        const pageTo = options.pageTo || Infinity;
        
        // Skip pages outside the requested range
        if (pageNum < pageFrom || pageNum > pageTo) {
          return Promise.resolve('');
        }
        
        // Use the default renderer for pages in range
        return null; // null means use default renderer
      };
    }
    
    // Parse the PDF
    pdf(dataBuffer, pdfOptions)
      .then(function(data) {
        const stats = fs.statSync(path);
        resolve({
          status: 'success',
          path: path,
          size: stats.size,
          pages: data.numpages,
          info: data.info,
          metadata: data.metadata,
          content: data.text,
          version: data.version
        });
      })
      .catch(function(error) {
        reject({
          status: 'error',
          path: path,
          error: error.message
        });
      });
  });
}

module.exports = {
  readPdfFile,
  readPdfFileSchema
};
