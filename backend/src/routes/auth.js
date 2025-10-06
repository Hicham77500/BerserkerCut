const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { defaultUserProfile } = require('../utils/defaults');
const { mergeDeep } = require('../utils/merge');
const { toClientUser } = require('../utils/users');

const router = express.Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return secret;
}

function createToken(userId) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}

function normalizeProfileOverrides(profileOverrides = {}) {
  const base = defaultUserProfile();
  return mergeDeep(base, profileOverrides);
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
  const user = new User({
    email: email.toLowerCase(),
    hashedPassword,
    profile: normalizeProfileOverrides(profile),
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

module.exports = router;
