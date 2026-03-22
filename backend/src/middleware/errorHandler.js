// Global error handler — catches any unhandled errors in the app
// This prevents Express from leaking stack traces to the client
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  // Don't leak internal error details to the client
  res.status(err.status || 500).json({
    error: err.status ? err.message : 'An unexpected error occurred.'
  });
};

// Catches async errors that weren't caught with try/catch
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };