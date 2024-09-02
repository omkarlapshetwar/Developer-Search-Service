const express = require('express');
const cors = require('cors');
const developerRoutes = require('./routes/developerRoutes');
const authRoutes = require('./routes/auth');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.url}`);
  next();
});

app.use('/api', developerRoutes);
app.use('/auth', authRoutes);

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
