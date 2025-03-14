const axios = require('axios');
const cheerio = require('cheerio');

/**
 * JSON Schema for web_search function parameters.
 */
const webSearchSchema = {
  type: "object",
  required: ["query", "maxResults"],
  additionalProperties: false,
  properties: {
    query: {
      type: "string",
      description: "The search query to be submitted to DuckDuckGo."
    },
    maxResults: {
      type: "number",
      description: "Maximum number of search results to return. default 10",
    }
  },
  description: "Performs a web search using DuckDuckGo Lite and returns the search results."
};

/**
 * Performs a web search using DuckDuckGo Lite and returns the search results.
 *
 * @param {Object} args - Arguments object
 * @param {string} args.query - The search query.
 * @param {number} [args.maxResults=10] - Maximum number of results to return.
 * @returns {Promise<Object>} A promise that resolves to an object with results array and metadata.
 */
async function webSearch(args) {
  const { query, maxResults = 10 } = args;
  return new Promise(async (resolve, reject) => {
    try {
      // Format query  
      const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
      
      // Fetch search results
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Parse HTML response
      const $ = cheerio.load(response.data);
      const results = [];
      
      // Process the result set in groups of 4 rows (title, description, url, spacer)
      // First row: index + title/link
      // Second row: description
      // Third row: display URL + timestamp
      // Fourth row: spacer
      let currentIndex = 0;
      
      // Find all rows with result links (these contain the titles)
      $('tbody > tr').each(function() {
        // Check if this row contains a search result (has a link with class 'result-link')
        const titleLink = $(this).find('a.result-link');
        if (titleLink.length > 0 && currentIndex < maxResults) {
          const title = titleLink.text().trim();
          const fullUrl = titleLink.attr('href');
          
          // Extract the actual URL from DuckDuckGo's redirect URL
          let url = fullUrl;
          if (fullUrl.includes('uddg=')) {
            try {
              url = decodeURIComponent(fullUrl.split('uddg=')[1].split('&')[0]);
            } catch (e) {
              // If extraction fails, use the original URL
              url = fullUrl;
            }
          }
          
          // Get the next row for description
          const descRow = $(this).next('tr');
          const description = descRow.find('td.result-snippet').text().trim();
          
          // Get the following row for display URL
          const urlRow = descRow.next('tr');
          const displayUrl = urlRow.find('span.link-text').text().trim();
          
          if (title && url) {
            results.push({
              title,
              url,
              description,
              displayUrl
            });
            currentIndex++;
          }
        }
      });
      
      resolve({
        results: results.slice(0, maxResults),
        metadata: {
          totalResults: results.length,
          source: 'DuckDuckGo Lite'
        }
      });
    } catch (error) {
      reject({
        error: error.message || 'An error occurred during web search',
        query
      });
    }
  });
}

module.exports = {
  webSearch,
  webSearchSchema
};
