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
      // Get the user's events
      const events = await makeGithubApiCall(`/users/${username}/events/public`);
      
      // Filter and aggregate contribution data
      const contributions = events.data
        .filter(event => 
          event.type === 'PullRequestEvent' || 
          event.type === 'IssuesEvent' || 
          event.type === 'PushEvent'
        )
        .reduce((acc, event) => {
          const repoName = event.repo.name;
          if (!acc[repoName]) {
            acc[repoName] = {
              repo: repoName,
              count: 0,
              html_url: `https://github.com/${repoName}`
            };
          }
          acc[repoName].count++;
          return acc;
        }, {});
      
      // Convert to array and sort by contribution count
      return Object.values(contributions)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Limit to top 10 contributions
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


async function getDeveloperStats(username) {
    try {
      const contributionsResponse = await makeGithubApiCall(`/users/${username}/events`);
      const contributions = contributionsResponse.data.filter(event => 
        event.type === 'PushEvent' || event.type === 'PullRequestEvent' || event.type === 'IssuesEvent'
      );
  
      const totalContributions = contributions.length;
      const longestStreak = calculateLongestStreak(contributions);
      const contributionCalendar = generateContributionCalendar(contributions);
      const averageCommitFrequency = calculateAverageCommitFrequency(contributions);
      const codeReviewParticipation = calculateCodeReviewParticipation(contributions);
      const pullRequestMergeRatio = calculatePullRequestMergeRatio(contributions);
      const organizationsContributedTo = calculateOrganizationsContributedTo(contributions);
      const openSourceProjectsContributedTo = calculateOpenSourceProjectsContributedTo(contributions);
  
      return {
        totalContributions,
        longestStreak,
        contributionCalendar,
        averageCommitFrequency,
        codeReviewParticipation,
        pullRequestMergeRatio,
        organizationsContributedTo,
        openSourceProjectsContributedTo
      };
    } catch (error) {
      logger.error(`Error fetching stats for ${username}`, { error: error.toString(), stack: error.stack });
      throw error;
    }
  }
  
  function calculateLongestStreak(contributions) {
    // This is a basic implementation. You might want to improve it based on your specific requirements.
    let currentStreak = 0;
    let longestStreak = 0;
    let lastContributionDate = null;
  
    contributions.forEach(contribution => {
      const contributionDate = new Date(contribution.created_at).toDateString();
      if (contributionDate === lastContributionDate) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      lastContributionDate = contributionDate;
    });
  
    return longestStreak;
  }
  
  function generateContributionCalendar(contributions) {
    // This generates a simple calendar for the last 365 days
    const calendar = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const value = contributions.filter(c => c.created_at.startsWith(dateString)).length;
      calendar.push({ day: dateString, value });
    }
    return calendar;
  }
  
  function calculateAverageCommitFrequency(contributions) {
    const pushEvents = contributions.filter(c => c.type === 'PushEvent');
    return pushEvents.length / 52; // Average per week over the last year
  }
  
  function calculateCodeReviewParticipation(contributions) {
    const reviewEvents = contributions.filter(c => c.type === 'PullRequestReviewEvent');
    return (reviewEvents.length / contributions.length) * 100;
  }
  
  function calculatePullRequestMergeRatio(contributions) {
    const prEvents = contributions.filter(c => c.type === 'PullRequestEvent');
    const mergedPRs = prEvents.filter(c => c.payload.action === 'closed' && c.payload.pull_request.merged);
    return mergedPRs.length / prEvents.length;
  }
  
  function calculateOrganizationsContributedTo(contributions) {
    const orgs = new Set(contributions.map(c => c.org?.login).filter(Boolean));
    return orgs.size;
  }
  
  function calculateOpenSourceProjectsContributedTo(contributions) {
    const repos = new Set(contributions.map(c => c.repo.name));
    return repos.size;
  }

module.exports = {
  getDeveloperProfile,
  getDeveloperRepos,
  getDeveloperContributions,
  getRepoPRs,
  getDeveloperStats
};