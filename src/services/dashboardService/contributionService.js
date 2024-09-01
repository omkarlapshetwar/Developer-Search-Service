const { makeGithubApiCall } = require('./githubService');
const logger = require('../utils/logger');

async function getDeveloperProfile(username) {
  try {
    const profile = await makeGithubApiCall(`/users/${username}`);
    return {
      login: profile.data.login,
      name: profile.data.name,
      avatar_url: profile.data.avatar_url,
      html_url: profile.data.html_url,
      bio: profile.data.bio,
      public_repos: profile.data.public_repos,
      followers: profile.data.followers,
      following: profile.data.following,
      location: profile.data.location,
      created_at: profile.data.created_at
    };
  } catch (error) {
    logger.error(`Error fetching profile for ${username}`, { error: error.toString(), stack: error.stack });
    throw error;
  }
}

async function getDeveloperRepos(username) {
  try {
    const response = await makeGithubApiCall(`/users/${username}/repos`, { sort: 'updated', per_page: 100 });
    return response.data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language
    }));
  } catch (error) {
    logger.error(`Error fetching repos for ${username}`, { error: error.toString(), stack: error.stack });
    throw error;
  }
}

async function getDeveloperContributions(username) {
  try {
    const events = await makeGithubApiCall(`/users/${username}/events/public`);
    const contributions = events.data
      .filter(event => event.type === 'PullRequestEvent' && event.payload.action === 'opened')
      .reduce((acc, event) => {
        const repoName = event.repo.name;
        if (!acc[repoName]) {
          acc[repoName] = {
            name: repoName,
            count: 0,
            html_url: `https://github.com/${repoName}`
          };
        }
        acc[repoName].count++;
        return acc;
      }, {});
    
    return Object.values(contributions);
  } catch (error) {
    logger.error(`Error fetching contributions for ${username}`, { error: error.toString(), stack: error.stack });
    throw error;
  }
}

async function getRepoPRs(username, owner, repo) {
  try {
    const prs = await makeGithubApiCall(`/repos/${owner}/${repo}/pulls`, {
      state: 'all',
      head: username,
      per_page: 100
    });
    
    return prs.data.map(pr => ({
      number: pr.number,
      title: pr.title,
      html_url: pr.html_url,
      state: pr.state,
      created_at: pr.created_at,
      closed_at: pr.closed_at
    }));
  } catch (error) {
    logger.error(`Error fetching PRs for ${username} in ${owner}/${repo}`, { error: error.toString(), stack: error.stack });
    throw error;
  }
}

module.exports = {
  getDeveloperProfile,
  getDeveloperRepos,
  getDeveloperContributions,
  getRepoPRs
};