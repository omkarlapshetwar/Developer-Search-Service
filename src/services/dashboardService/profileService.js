const { makeGithubApiCall } = require('../githubService');
const logger = require('../../utils/logger');

async function getProfile(username) {
  try {
    const response = await makeGithubApiCall(`/users/${username}`);
    return {
      login: response.data.login,
      name: response.data.name,
      avatar_url: response.data.avatar_url,
      html_url: response.data.html_url,
      bio: response.data.bio,
      public_repos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
      location: response.data.location,
      created_at: response.data.created_at
    };
  } catch (error) {
    logger.error(`Error fetching profile for ${username}`, { 
      error: error.toString(),
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  getProfile
};