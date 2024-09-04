const express = require('express');
const developerController = require('../controllers/developerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/external-contributors', authMiddleware, developerController.getExternalContributors);
router.get('/developer-profile/:username', authMiddleware, developerController.getDeveloperProfile);
router.get('/developer-repos/:username', authMiddleware, developerController.getDeveloperRepos);
router.get('/developer-contributions/:username', authMiddleware, developerController.getDeveloperContributions);
router.get('/repo-prs/:username/:owner/:repo', authMiddleware, developerController.getRepoPRs);
router.get('/developer-stats/:username', authMiddleware, developerController.getDeveloperStats);

module.exports = router;