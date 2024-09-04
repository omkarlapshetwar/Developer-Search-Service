const dashboardService = require('../services/dashboardService');
const { searchExternalContributors } = require('../services/githubService');
const logger = require('../utils/logger');

exports.getExternalContributors = async (req, res) => {
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
};

exports.getDeveloperProfile = async (req, res) => {
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
};

exports.getDeveloperRepos = async (req, res) => {
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
};

exports.getDeveloperContributions = async (req, res) => {
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
};

exports.getRepoPRs = async (req, res) => {
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
};

exports.getDeveloperStats = async (req, res) => {
    try {
      const stats = await dashboardService.getDeveloperStats(req.params.username);
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching developer stats', { 
        error: error.toString(),
        stack: error.stack,
        username: req.params.username
      });
      res.status(500).json({ error: 'An error occurred while fetching developer stats' });
    }
  };