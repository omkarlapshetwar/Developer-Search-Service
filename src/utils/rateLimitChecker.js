// src/utils/rateLimitChecker.js

const axios = require('axios');
const logger = require('./logger');
require('dotenv').config();

async function checkRateLimit() {
  try {
    const response = await axios.get('https://api.github.com/rate_limit', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });
    
    const { core } = response.data.resources;
    logger.info(`Rate Limit - Limit: ${core.limit}, Used: ${core.used}, Remaining: ${core.remaining}, Reset: ${new Date(core.reset * 1000).toLocaleString()}`);
    
    return core.remaining;
  } catch (error) {
    logger.error('Error checking rate limit', { 
      error: error.toString(),
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    return 0;
  }
}

module.exports = checkRateLimit;
