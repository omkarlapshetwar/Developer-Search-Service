const profileService = require('./profileService');
const repoService = require('./repoService');
const contributionService = require('./contributionService');
const logger = require('../../utils/logger');

async function getDeveloperDashboard(username) {
  try {
    const [profile, repos, contributions] = await Promise.all([
      profileService.getProfile(username),
      repoService.getRepos(username),
      contributionService.getContributions(username)
    ]);

    return {
      profile,
      ...repos,
      ...contributions
    };
  } catch (error) {
    logger.error(`Error fetching dashboard for ${username}`, { 
      error: error.toString(),
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  getDeveloperDashboard
};