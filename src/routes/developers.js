// src/routes/developers.js
const express = require('express');
const { searchExternalContributors } = require('../services/githubService');
const logger = require('../utils/logger');

const router = express.Router();

// Route to get external contributors with filters in the request body
router.post('/external-contributors', async (req, res) => {
  try {
    const { page = 1, perPage = 10, filters = {} } = req.body;
    
    const contributors = await searchExternalContributors(page, perPage, filters);
    
    if (contributors.length > 0) {
      logger.info(`Fetched ${contributors.length} contributors for page ${page}, perPage ${perPage}`);
    } else {
      logger.info(`No contributors found for page ${page}, perPage ${perPage}`);
    }
    
    res.json(contributors);
  } catch (error) {
    logger.error('Error fetching external contributors:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching external contributors' });
  }
});

module.exports = router;
