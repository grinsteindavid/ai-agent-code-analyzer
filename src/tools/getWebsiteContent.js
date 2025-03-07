const axios = require('axios');
const cheerio = require('cheerio');
const { storeWebsiteContent, getWebsiteContent } = require('../utils/context');

/**
 * JSON Schema for get_website_content function parameters.
 */
const getWebsiteContentSchema = {
  type: "object",
  properties: {
    url: {
      type: "string",
      description: "The URL of the website to fetch content from."
    },
    chunkSize: {
      type: "number",
      description: "Size of each content chunk in number of lines.",
      default: 100,
    },
    maxChunks: {
      type: "number",
      description: "Maximum number of chunks to return.",
      default: 1,
    },
    chunkIndex: {
      type: "number",
      description: "Index of the specific chunk to retrieve (if already stored). If not provided, returns first maxChunks chunks.",
    },
    forceRefresh: {
      type: "boolean",
      description: "Force refresh the content even if it's already stored.",
      default: false
    }
  },
  required: ["url", "chunkSize", "maxChunks", "chunkIndex", "forceRefresh"],
  additionalProperties: false,
  description: "Gets the entire content from a website URL and retrives only a partial chunk of it."
};

/**
 * Fetches website content, chunks it, and returns specified chunks
 *
 * @param {string} url - The URL to fetch content from
 * @param {number} [chunkSize=100] - Size of each content chunk in number of lines
 * @param {number} [maxChunks=1] - Maximum number of chunks to return
 * @param {number} [chunkIndex] - Index of specific chunk to retrieve
 * @param {boolean} [forceRefresh=false] - Force refresh content even if cached
 * @returns {Promise<Object>} A promise that resolves to an object with chunks and metadata
 */
async function getWebsiteContentTool(url, chunkSize = 100, maxChunks = 1, chunkIndex = undefined, forceRefresh = false) {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate URL
      if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error('Invalid URL format. URL must start with http:// or https://');
      }
      // Check if we already have this URL cached and whether we need to refresh
      let contentData = getWebsiteContent(url);
      
      if (!contentData || forceRefresh) {
        // Fetch the website content with improved error handling and timeout
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'DNT': '1'
          },
          timeout: 10000, // 10 second timeout
          maxContentLength: 10 * 1024 * 1024, // 10MB max content size
          maxBodyLength: 10 * 1024 * 1024, // 10MB max body size
          maxRedirects: 5 // Maximum of 5 redirects
        });
        
        // Determine content type and process accordingly
        const contentType = response.headers['content-type'] || 'text/html';
        let fullText = '';
        let title = url.split('/').pop() || 'Untitled Resource';
        
        // Check if the response is binary
        const isBinaryResponse = isBinaryContent(contentType, response.data);
        
        if (isBinaryResponse) {
          // For binary content, we just provide metadata
          fullText = `[Binary content detected: ${contentType}]`;
        } else if (contentType.includes('text/html')) {
          // HTML content processing
          const $ = cheerio.load(response.data);
          
          // Get the title
          title = $('title').text().trim() || title;
          
          // Remove script, style elements, and other non-content elements to clean the content
          $('script, style, meta, link, noscript, iframe, nav, footer, header, aside, svg, path, form, input, button').remove();
          
          // Focus on potential content areas first
          let contentSections = $('article, main, .content, .article, .post, #content, #main');
          
          // If we found specific content sections, extract from those first
          if (contentSections.length > 0) {
            contentSections.each((i, el) => {
              fullText += $(el).text() + ' ';
            });
          } else {
            // Fallback: extract text from specific tags likely to contain meaningful content
            $('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre, code, dl, dt, dd').each((i, el) => {
              fullText += $(el).text() + ' ';
            });
            
            // If still no content, fall back to body text as a last resort
            if (!fullText.trim()) {
              fullText = $('body').text();
            }
          }
          
          // Clean the text
          fullText = cleanText(fullText);
        } else if (contentType.includes('application/json')) {
          // JSON content processing
          let jsonData;
          try {
            // If it's already an object, use it directly, otherwise parse it
            jsonData = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
            title = 'JSON: ' + (url.split('/').pop() || 'Data');
            fullText = JSON.stringify(jsonData, null, 2);
          } catch (e) {
            fullText = String(response.data); // Fallback to string representation
          }
        } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
          // XML content processing
          title = 'XML: ' + (url.split('/').pop() || 'Data');
          try {
            // Try to load with cheerio to extract text
            const $ = cheerio.load(response.data, { xmlMode: true });
            fullText = $.text();
            fullText = cleanText(fullText);
          } catch (e) {
            fullText = String(response.data); // Fallback to string representation
          }
        } else if (contentType.includes('text/')) {
          // General text content (plain text, CSS, JavaScript, etc.)
          title = contentType.split('/')[1].toUpperCase() + ': ' + (url.split('/').pop() || 'Text');
          fullText = String(response.data);
          fullText = cleanText(fullText);
        } else {
          // Unknown format - convert to string if possible
          fullText = `[Content type: ${contentType}]\n` + String(response.data);
        }
        
        // Divide content into chunks of approximately chunkSize lines
        const lines = fullText.split('\n');
        const chunks = [];
        for (let i = 0; i < lines.length; i += chunkSize) {
          chunks.push(lines.slice(i, i + chunkSize).join('\n'));
        }
        
        // Store content data in context
        contentData = {
          url,
          title,
          totalChunks: chunks.length,
          chunks,
          fetchedAt: new Date().toISOString(),
          chunkSize,
          contentType: response.headers['content-type'] || 'unknown',
          statusCode: response.status,
          byteSize: fullText.length
        };
        
        storeWebsiteContent(url, contentData);
      }
      
      // Determine which chunks to return
      let chunksToReturn = [];
      if (chunkIndex !== undefined) {
        // Return specific chunk if requested
        if (chunkIndex >= 0 && chunkIndex < contentData.chunks.length) {
          chunksToReturn = [contentData.chunks[chunkIndex]];
        }
      } else {
        // Return first maxChunks chunks
        chunksToReturn = contentData.chunks.slice(0, maxChunks);
      }
      
      resolve({
        url: contentData.url,
        title: contentData.title,
        totalChunks: contentData.totalChunks,
        chunks: chunksToReturn,
        chunkIndices: chunkIndex !== undefined ? [chunkIndex] : [...Array(chunksToReturn.length).keys()],
        fetchedAt: contentData.fetchedAt,
        contentType: contentData.contentType,
        statusCode: contentData.statusCode,
        byteSize: contentData.byteSize,
        message: `Retrieved ${chunksToReturn.length} of ${contentData.totalChunks} chunks (lines of text)`
      });
    } catch (error) {
      // Provide more descriptive error messages based on the error type
      let errorMessage = error.message || 'An error occurred while fetching website content';
      let errorType = 'unknown';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The website may be slow or unavailable.';
        errorType = 'timeout';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Domain not found. Please check the URL and try again.';
        errorType = 'not_found';
      } else if (error.response) {
        // Server responded with a non-2xx status code
        const status = error.response.status;
        errorType = `status_${status}`;
        
        switch(status) {
          case 401:
            errorMessage = 'Authorization required. The website requires authentication.';
            break;
          case 403:
            errorMessage = 'Access forbidden. The website has denied access to the requested content.';
            break;
          case 404:
            errorMessage = 'Content not found. The requested URL does not exist on this server.';
            break;
          case 429:
            errorMessage = 'Too many requests. Rate limit exceeded for this website.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = `Server error (${status}). The website is experiencing technical issues.`;
            break;
          default:
            errorMessage = `HTTP Error ${status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response was received
        errorMessage = 'No response from server. The website may be down or unreachable.';
        errorType = 'no_response';
      } else if (errorMessage.includes('Header overflow')) {
        errorMessage = 'Header overflow. The website returned headers that are too large to process.';
        errorType = 'header_overflow';
      } else if (errorMessage.includes('maxContentLength')) {
        errorMessage = 'Content too large. The website content exceeds the maximum size limit.';
        errorType = 'content_too_large';
      }
      
      // Return a structured error object
      reject({
        error: errorMessage,
        errorType,
        url,
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * Check if content appears to be binary based on content type or content examination
 * @param {string} contentType - Content-Type header value
 * @param {*} data - Response data
 * @returns {boolean} True if the content appears to be binary
 */
function isBinaryContent(contentType, data) {
  // Common binary content types
  const binaryTypes = [
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'application/gzip',
    'application/x-bzip',
    'application/x-bzip2',
    'application/java-archive',
    'application/vnd.ms-',
    'application/vnd.openxmlformats-',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'image/',
    'audio/',
    'video/'
  ];
  
  // Check if content type matches known binary types
  if (binaryTypes.some(type => contentType.includes(type))) {
    return true;
  }
  
  // If it's a string, check for binary characters
  if (typeof data === 'string') {
    const nonPrintableChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(data.slice(0, 1000));
    return nonPrintableChars;
  }
  
  // If it's a Buffer or ArrayBuffer, it's binary
  if (Buffer.isBuffer(data) || 
      (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer)) {
    return true;
  }
  
  return false;
}

/**
 * Clean and normalize text content
 * @param {string} text - Raw text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Remove excessive whitespace
    .replace(/\[.*?\]/g, '') // Remove content in square brackets
    .replace(/\(.*?\)/g, '') // Remove content in parentheses if they're likely references
    .replace(/[\t\n\r]+/g, ' ') // Replace tabs and newlines
    .trim();
}

module.exports = {
  getWebsiteContent: getWebsiteContentTool,
  getWebsiteContentSchema
};
