const express = require('express');
const cors = require('cors');
const developerRoutes = require('./routes/developers');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.url}`);
  next();
});

app.use('/api', developerRoutes);

app.use((err, req, res, next) => {
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
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});