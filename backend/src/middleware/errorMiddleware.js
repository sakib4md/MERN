/**
 * Global error handler - must be LAST middleware in server.js
 * Express recognizes it by the 4 arguments (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ [ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
