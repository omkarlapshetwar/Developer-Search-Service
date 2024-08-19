// src/index.js
const express = require('express');
const developerRoutes = require('./routes/developers');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Middleware to log all incoming requests
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.url}`);
  next();
});

// Use the developer routes
app.use('/api', developerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});
