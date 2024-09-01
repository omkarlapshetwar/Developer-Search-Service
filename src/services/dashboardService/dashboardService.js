const { makeGithubApiCall } = require('./githubService');
const logger = require('../utils/logger');

async function getDeveloperProfile(username) {
  try {
    const [profile, events] = await Promise.all([
      makeGithubApiCall(`/users/${username}`),
      makeGithubApiCall(`/users/${username}/events/public`)
    ]);

    const pullRequests = events.data.filter(event => event.type === 'PullRequestEvent');
    const externalContributions = events.data.filter(event => 
      (event.type === 'PushEvent' || event.type === 'PullRequestEvent') &&
      event.repo.name.split('/')[0] !== username
    );

    return {
      profile: {
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
      },
      prStats: {
        openPRs: pullRequests.filter(pr => pr.payload.action === 'opened').length,
        mergedPRs: pullRequests.filter(pr => pr.payload.action === 'closed' && pr.payload.pull_request.merged).length
      },
      externalContributions: externalContributions.map(event => ({
        repo: event.repo.name,
        type: event.type,
        created_at: event.created_at
      }))
    };
  } catch (error) {
    logger.error(`Error fetching developer data for ${username}`, { 
      error: error.toString(),
      stack: error.stack
    });
    throw error;
  }
}

async function getDeveloperRepos(username) {
  try {
    const response = await makeGithubApiCall(`/users/${username}/repos`, { sort: 'updated', per_page: 100 });
    return response.data.map(repo => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      html_url: repo.html_url
    }));
  } catch (error) {
    logger.error(`Error fetching repos for ${username}`, { 
      error: error.toString(),
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  getDeveloperProfile,
  getDeveloperRepos
};