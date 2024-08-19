// src/utils/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Define the log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create the logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info' level
  format: combine(
    timestamp(), // Add a timestamp to each log
    logFormat // Use the custom format defined above
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Colorize the output for easier reading
        logFormat // Use the same custom format for console logs
      )
    }),
    new transports.File({ filename: 'logs/app.log' }) // Log to a file as well
  ]
});

module.exports = logger;
