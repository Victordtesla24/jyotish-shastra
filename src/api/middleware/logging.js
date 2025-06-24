const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Only log in development mode to avoid cluttering test output
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
};

module.exports = logRequest;
