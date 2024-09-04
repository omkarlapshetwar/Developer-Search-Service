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


const allowedOrigins = [
  'http://localhost:3000',
  'https://e0ee-2401-4900-1c97-3f32-4146-f185-7352-7481.ngrok-free.app',
  'https://a958-2401-4900-1c97-3f32-4146-f185-7352-7481.ngrok-free.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());


app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.url}`);
  next();
});

// app.options('*', cors()); // Preflight response for all routes

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