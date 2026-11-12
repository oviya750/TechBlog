const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultDevSecret = 'techblog_super_secret_jwt_key_nature_tech_2026_dev_env';

  if (isProduction) {
    if (!secret || secret === defaultDevSecret || secret.length < 32) {
      throw new Error(
        'SECURITY VIOLATION: A high-entropy JWT_SECRET (minimum 32 characters) must be configured in production.'
      );
    }
    return secret;
  }

  return secret || defaultDevSecret;
};

const getJwtExpiresIn = () => {
  return process.env.JWT_EXPIRE || '30d';
};

const generateToken = (id) => {
  return jwt.sign(
    { id: id.toString() },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  getJwtSecret,
  getJwtExpiresIn,
  generateToken,
  verifyToken
};
