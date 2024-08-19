// src/utils/rateLimitChecker.js
const axios = require('axios');
const logger = require('./logger');

// Function to check the current rate limit status
async function checkRateLimit() {
  try {
    const response = await axios.get('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });
    
    const { core } = response.data.resources;
    logger.info(`Rate Limit - Limit: ${core.limit}, Used: ${core.used}, Remaining: ${core.remaining}, Reset: ${new Date(core.reset * 1000).toLocaleString()}`);
    
    return core.remaining > 0;
  } catch (error) {
    logger.error('Error checking rate limit:', error.message);
    return false;
  }
}

module.exports = checkRateLimit;
