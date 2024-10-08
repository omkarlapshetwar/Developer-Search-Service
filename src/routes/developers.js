const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { searchExternalContributors } = require('../services/githubService');
const logger = require('../utils/logger');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/external-contributors', authenticateToken, async (req, res) => {
  try {
    let { page = 1, perPage = 10, ...filters } = req.body;
    const contributors = await searchExternalContributors(page, perPage, filters);
    
    if (contributors.length > 0) {
      logger.info(`Fetched ${contributors.length} contributors for page ${page}, perPage ${perPage}`);
    } else {
      logger.info(`No contributors found for page ${page}, perPage ${perPage}`);
    }

    res.json(contributors);
  } catch (error) {
    logger.error('Error fetching external contributors', { 
      error: error.toString(),
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ error: 'An error occurred while fetching external contributors' });
  }
});

router.get('/developer-profile/:username', authenticateToken, async (req, res) => {
  try {
    const profile = await dashboardService.getDeveloperProfile(req.params.username);
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching developer profile', { 
      error: error.toString(),
      stack: error.stack,
      username: req.params.username
    });
    res.status(500).json({ error: 'An error occurred while fetching the developer profile' });
  }
});

router.get('/developer-repos/:username', authenticateToken, async (req, res) => {
  try {
    const repos = await dashboardService.getDeveloperRepos(req.params.username);
    res.json(repos);
  } catch (error) {
    logger.error('Error fetching developer repos', { 
      error: error.toString(),
      stack: error.stack,
      username: req.params.username
    });
    res.status(500).json({ error: 'An error occurred while fetching developer repositories' });
  }
});

router.get('/developer-contributions/:username', authenticateToken, async (req, res) => {
  try {
    const contributions = await dashboardService.getDeveloperContributions(req.params.username);
    res.json(contributions);
  } catch (error) {
    logger.error('Error fetching developer contributions', { 
      error: error.toString(),
      stack: error.stack,
      username: req.params.username
    });
    res.status(500).json({ error: 'An error occurred while fetching developer contributions' });
  }
});

router.get('/repo-prs/:username/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { username, owner, repo } = req.params;
    const prs = await dashboardService.getRepoPRs(username, owner, repo);
    res.json(prs);
  } catch (error) {
    logger.error('Error fetching repo PRs', { 
      error: error.toString(),
      stack: error.stack,
      username: req.params.username,
      owner: req.params.owner,
      repo: req.params.repo
    });
    res.status(500).json({ error: 'An error occurred while fetching repository PRs' });
  }
});

module.exports = router;
