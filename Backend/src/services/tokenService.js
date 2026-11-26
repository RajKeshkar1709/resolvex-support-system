const jwt = require('jsonwebtoken');
const config = require('../config/environment');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
    },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
};

const sendTokenCookies = (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const isProd = config.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // Must be true on HTTPS (Render)
    sameSite: isProd ? 'none' : 'lax', // Must be 'none' for cross-domain cookies (vercel -> render)
  };

  // 15 minutes for access token
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // 7 days for refresh token
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

const clearTokenCookies = (res) => {
  const isProd = config.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // Must be true on HTTPS (Render)
    sameSite: isProd ? 'none' : 'lax', // Must be 'none' for cross-domain cookies (vercel -> render)
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendTokenCookies,
  clearTokenCookies,
};
