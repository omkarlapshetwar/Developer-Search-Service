const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.toString(),
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query
  });

  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
