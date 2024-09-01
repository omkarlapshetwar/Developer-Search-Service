const { makeGithubApiCall } = require('../githubService');
const logger = require('../../utils/logger');

async function getRepos(username) {
  try {
    const response = await makeGithubApiCall(`/users/${username}/repos`, { sort: 'updated', per_page: 100 });
    const repos = response.data;

    const ownRepos = repos.filter(repo => repo.owner.login === username);
    const contributedRepos = repos.filter(repo => repo.owner.login !== username);

    return {
      ownRepos: ownRepos.map(formatRepo),
      contributedRepos: contributedRepos.map(formatRepo)
    };
  } catch (error) {
    logger.error(`Error fetching repos for ${username}`, { 
      error: error.toString(),
      stack: error.stack
    });
    throw error;
  }
}

function formatRepo(repo) {
  return {
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    html_url: repo.html_url
  };
}

module.exports = {
  getRepos
};