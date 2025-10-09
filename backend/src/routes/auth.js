const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { defaultUserProfile } = require('../utils/defaults');
const { mergeDeep } = require('../utils/merge');
const { toClientUser, normalizeProfileInput } = require('../utils/users');

const router = express.Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return secret;
}

function createTokens(userId) {
  const accessToken = jwt.sign({ userId }, getJwtSecret(), { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded.type === 'refresh' ? decoded : null;
  } catch (err) {
    return null;
  }
}

function normalizeProfileOverrides(profileOverrides = {}) {
  const base = defaultUserProfile();
  const safeOverrides = normalizeProfileInput(profileOverrides, { fillDefaults: true }) || {};
  return mergeDeep(base, safeOverrides);
}

router.post('/register', async (req, res) => {
  const { email, password, profile } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const mergedProfile = normalizeProfileOverrides(profile);
  const user = new User({
    email: email.toLowerCase(),
    hashedPassword,
    profile: mergedProfile,
  });

  await user.save();

  const token = createToken(user.id);
  return res.status(201).json({
    token,
    user: toClientUser(user),
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.hashedPassword);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user.id);
  return res.json({
    token,
    user: toClientUser(user),
  });
});

router.post('/logout', (_, res) => {
  // Stateless JWTs: logout is handled client-side by discarding the token.
  return res.status(204).send();
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const tokens = createTokens(user.id);
  return res.json({
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: toClientUser(user)
  });
});

module.exports = router;
