const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('⚠️ Express Error Handler:', err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with this ${field} (${err.keyValue[field]}) already exists.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired.' });
  }

  // Multer Error
  if (err.name === 'MulterError' || (err.message && err.message.includes('Only image files'))) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  // CORS forbidden
  if (err.message && err.message.includes('not permitted by CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && isProduction ? 'An internal server error occurred.' : (error.message || 'Server Internal Error'),
    ...(isProduction ? {} : { stack: err.stack })
  });
};

module.exports = errorHandler;

