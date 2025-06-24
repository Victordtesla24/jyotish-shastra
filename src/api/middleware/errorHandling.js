module.exports = function errorHandling(err, req, res, next) {
  // Log the error (could be enhanced to use a logger)
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
};
