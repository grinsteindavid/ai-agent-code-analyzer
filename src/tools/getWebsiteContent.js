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
      description: "Size of each content chunk in number of lines. default 200",
    },
    chunkIndex: {
      type: "number",
      description: "Index of the specific chunk to retrieve (if already stored). If not provided, returns first maxChunks chunks.",
    },
    forceRefresh: {
      type: "boolean",
      description: "Force refresh the content even if it's already stored. default false",
    },
  },
  required: ["url", "chunkSize", "chunkIndex", "forceRefresh"],
  additionalProperties: false,
  description: "Reads website content from a URL and returns only a partial chunk of it. Can be used to retrieve specific sections of a website's content."
};

/**
 * Fetches website content, chunks it, and returns specified chunks
 *
 * @param {Object} args - The arguments object
 * @param {string} args.url - The URL to fetch content from
 * @param {number} [args.chunkSize=200] - Size of each content chunk in number of lines
 * @param {number} [args.chunkIndex] - Index of specific chunk to retrieve
 * @param {boolean} [args.forceRefresh=false] - Force refresh content even if cached
 * @returns {Promise<Object>} A promise that resolves to an object with chunks and metadata
 */
async function getWebsiteContentTool(args) {
  const {
    url,
    chunkSize = 200,
    chunkIndex,
    forceRefresh = false
  } = args;

  const maxChunks = 1;

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
          
          fullText = $('body').text();
          
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
        
        // Divide content into chunks based on character count rather than just newlines
        // This ensures more consistent chunking even for content with few or no newlines
        const targetChunkLength = chunkSize * 80; // Approx 80 chars per line as estimate
        const chunks = [];
        let currentChunk = "";
        
        // Try to split on natural boundaries when possible
        const paragraphs = fullText.split(/\n\s*\n|\r\n\s*\r\n/); // Split on paragraph breaks
        
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i].trim();
          
          // If adding this paragraph would make the chunk too large
          if (currentChunk && (currentChunk.length + paragraph.length > targetChunkLength)) {
            // Store the current chunk and start a new one
            chunks.push(currentChunk);
            currentChunk = paragraph;
          } else if (paragraph) {
            // Add a newline between paragraphs if needed
            currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
          }
          
          // Handle long paragraphs - split them further if needed
          while (currentChunk.length > targetChunkLength * 1.5) {
            // Find a good splitting point - preferably at the end of a sentence
            let splitPoint = targetChunkLength;
            
            // Try to find the end of a sentence near the target length
            const sentenceEndMatch = currentChunk.slice(targetChunkLength * 0.8, targetChunkLength * 1.2).match(/[.!?]\s/); 
            if (sentenceEndMatch) {
              splitPoint = currentChunk.slice(0, targetChunkLength * 0.8).length + 
                          sentenceEndMatch.index + 2; // +2 to include the punctuation and space
            }
            
            chunks.push(currentChunk.slice(0, splitPoint));
            currentChunk = currentChunk.slice(splitPoint);
          }
        }
        
        // Add the last chunk if there's anything left
        if (currentChunk) {
          chunks.push(currentChunk);
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
        chunkIndex,
        fetchedAt: contentData.fetchedAt,
        contentType: contentData.contentType,
        statusCode: contentData.statusCode,
        byteSize: contentData.byteSize,
        message: `Retrieved ${chunksToReturn.length} of ${contentData.totalChunks} chunks (lines of text) in memory.`
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
    .replace(/\s{2,}/g, ' ') // Replace excessive whitespace with a single space
    .replace(/\[.*?\]/g, '') // Remove content in square brackets
    .replace(/\(.*?\)/g, '') // Remove content in parentheses if they're likely references
    .replace(/\t/g, ' ')      // Replace tabs with spaces
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with just two
    .trim();
}

module.exports = {
  getWebsiteContent: getWebsiteContentTool,
  getWebsiteContentSchema
};
