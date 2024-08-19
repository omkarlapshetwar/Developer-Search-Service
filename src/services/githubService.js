// src/services/githubService.js
const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');
const checkRateLimit = require('../utils/rateLimitChecker');

// Initialize cache with a TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// Set up the GitHub API client
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${process.env.GITHUB_TOKEN}`
  }
});

// Retry mechanism
async function retryApiCall(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      logger.warn(`API call failed, retrying (${i + 1}/${maxRetries}): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// Fetch external contributions (repos that the user doesn't own)
async function getExternalContributions(username) {
  try {
    const events = await retryApiCall(() => githubApi.get(`/users/${username}/events/public`));
    const externalContributions = events.data.filter(event => 
      (event.type === 'PushEvent' || event.type === 'PullRequestEvent') &&
      event.repo.name.split('/')[0] !== username
    );
    return externalContributions.length;
  } catch (error) {
    logger.error(`Error fetching contributions for ${username}: ${error.message}`);
    return 0;
  }
}

// Fetch developer details
async function getDeveloperDetails(username) {
  try {
    const response = await retryApiCall(() => githubApi.get(`/users/${username}`));
    if (response && response.data) {
      return {
        login: username,
        html_url: response.data.html_url,
        public_repos: response.data.public_repos,
        followers: response.data.followers,
        location: response.data.location,
        created_at: response.data.created_at
      };
    } else {
      return null;
    }
  } catch (error) {
    logger.error(`Error fetching details for ${username}: ${error.message}`);
    return null;
  }
}

// Search for users with external contributions
async function searchExternalContributors(page = 1, perPage = 10, filters = {}) {
  const isUnderRateLimit = await checkRateLimit();
  if (!isUnderRateLimit) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const cacheKey = `external-contributors-${page}-${perPage}-${JSON.stringify(filters)}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    logger.info(`Returning cached result for page ${page} and perPage ${perPage}`);
    return cachedResult;
  }

  try {
    let query = 'type:user';

    if (filters.location) query += ` location:"${filters.location}"`;
    if (filters.language) query += ` language:${filters.language}`;
    if (filters.followers) query += ` followers:>=${filters.followers}`;
    if (filters.repos) query += ` repos:>=${filters.repos}`;
    if (filters.created) query += ` created:>${filters.created}`;
    if (filters.lastActive) query += ` pushed:>${filters.lastActive}`;
    if (filters.topics) {
      filters.topics.split(',').forEach(topic => {
        query += ` topic:${topic.trim()}`;
      });
    }

    const response = await retryApiCall(() => githubApi.get('/search/users', {
      params: { 
        q: query,
        sort: 'repositories', 
        order: 'desc',
        per_page: 100,
        page: page
      }
    }));

    const users = response.data.items;
    const contributors = await Promise.all(users.map(async (user) => {
      const externalContributionCount = await getExternalContributions(user.login);
      if (externalContributionCount === 0) return null;

      const details = await getDeveloperDetails(user.login);
      if (!details) return null;

      return {
        ...details,
        contribution_count: externalContributionCount
      };
    }));

    const filteredContributors = contributors.filter(c => c !== null);
    filteredContributors.sort((a, b) => b.contribution_count - a.contribution_count);

    const paginatedContributors = filteredContributors.slice(0, perPage);

    logger.info(`Returning ${paginatedContributors.length} contributors for page ${page}, perPage ${perPage}`);

    cache.set(cacheKey, paginatedContributors);

    return paginatedContributors.map(({ login, html_url, contribution_count, public_repos, followers, location, created_at }) => ({
      login,
      html_url,
      contribution_count,
      public_repos,
      followers,
      location,
      created_at
    }));
  } catch (error) {
    logger.error('Error searching external contributors:', error.message);
    throw error;
  }
}

module.exports = {
  searchExternalContributors,
  getExternalContributions,
  getDeveloperDetails,
};
