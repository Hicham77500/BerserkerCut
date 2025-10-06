const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const TrainingProfile = require('../models/TrainingProfile');
const { requireAuth } = require('../middleware/auth');
const { mergeDeep } = require('../utils/merge');
const { defaultUserProfile } = require('../utils/defaults');
const { toClientUser } = require('../utils/users');

const router = express.Router();

function ensureSameUser(requestedId, authenticatedUserId) {
  if (requestedId !== authenticatedUserId) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid user id');
    error.status = 400;
    throw error;
  }
  return new mongoose.Types.ObjectId(id);
}

router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  ensureSameUser(id, req.userId);

  const objectId = ensureObjectId(id);
  const user = await User.findById(objectId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(toClientUser(user));
});

router.patch('/:id/profile', requireAuth, async (req, res) => {
  const { id } = req.params;
  ensureSameUser(id, req.userId);

  const profileUpdates = req.body || {};
  const objectId = ensureObjectId(id);
  const user = await User.findById(objectId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const currentProfile = user.profile
    ? JSON.parse(JSON.stringify(user.profile))
    : defaultUserProfile();
  const mergedProfile = mergeDeep(currentProfile, profileUpdates);
  user.profile = mergedProfile;
  user.markModified('profile');
  await user.save();

  return res.json(toClientUser(user));
});

router.put('/:id/training-profile', requireAuth, async (req, res) => {
  const { id } = req.params;
  ensureSameUser(id, req.userId);
  const objectId = ensureObjectId(id);

  const trainingPayload = req.body || {};

  if (!trainingPayload.healthDeclaration?.declareGoodHealth) {
    return res.status(400).json({
      message: "La déclaration de bonne santé est obligatoire",
    });
  }

  if (!trainingPayload.healthDeclaration?.acknowledgeDisclaimer) {
    return res.status(400).json({
      message: "L'acceptation des conditions est obligatoire",
    });
  }

  const profileToStore = {
    ...trainingPayload,
    completedAt: trainingPayload.completedAt
      ? new Date(trainingPayload.completedAt)
      : new Date(),
    savedAt: new Date(),
  };

  const record = await TrainingProfile.findOneAndUpdate(
    { userId: objectId },
    { profile: profileToStore },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(204).send();
});

router.get('/:id/training-profile', requireAuth, async (req, res) => {
  const { id } = req.params;
  ensureSameUser(id, req.userId);
  const objectId = ensureObjectId(id);

  const record = await TrainingProfile.findOne({ userId: objectId });

  if (!record) {
    return res.json(null);
  }

  const rawProfile = record.profile || null;
  if (!rawProfile) {
    return res.json(null);
  }

  const plainProfile = JSON.parse(JSON.stringify(rawProfile));
  if (plainProfile.completedAt) {
    plainProfile.completedAt = new Date(plainProfile.completedAt).toISOString();
  }

  return res.json(plainProfile);
});

module.exports = router;
