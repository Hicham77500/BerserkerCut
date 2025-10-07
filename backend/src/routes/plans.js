const express = require('express');
const mongoose = require('mongoose');
const DailyPlan = require('../models/DailyPlan');
const { requireAuth } = require('../middleware/auth');
const { markSupplementTaken, sanitizePlan } = require('../utils/plans');

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

router.put('/:planId', requireAuth, async (req, res) => {
  const { planId } = req.params;
  const payload = req.body || {};

  if (!payload.userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  ensureSameUser(payload.userId, req.userId);
  const userObjectId = ensureObjectId(payload.userId);

  const planDate = payload.date ? new Date(payload.date) : new Date();

  const setFields = {
    userId: userObjectId,
    date: planDate,
    dayType: payload.dayType || 'training',
    nutritionPlan: payload.nutritionPlan || {},
    supplementPlan: payload.supplementPlan || {},
    dailyTip: payload.dailyTip || '',
    completed: Boolean(payload.completed),
    updatedAt: new Date(),
  };

  const update = {
    $set: setFields,
    $setOnInsert: {
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    },
  };

  const plan = await DailyPlan.findByIdAndUpdate(planId, update, {
    new: true,
    upsert: true,
  });

  return res.json(sanitizePlan(plan));
});

router.get('/today', requireAuth, async (req, res) => {
  const { userId } = req.query || {};
  if (!userId) {
    return res.status(400).json({ message: 'userId query parameter is required' });
  }

  ensureSameUser(userId, req.userId);
  const userObjectId = ensureObjectId(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const plan = await DailyPlan.findOne({
    userId: userObjectId,
    date: { $gte: today, $lt: tomorrow },
  });

  if (!plan) {
    return res.json(null);
  }

  return res.json(sanitizePlan(plan));
});

router.post('/:planId/supplements/:supplementId/taken', requireAuth, async (req, res) => {
  const { planId, supplementId } = req.params;
  const plan = await DailyPlan.findById(planId);

  if (!plan) {
    return res.status(404).json({ message: 'Plan not found' });
  }

  const planUserId = plan.userId.toString();
  ensureSameUser(planUserId, req.userId);

  const { updatedPlan, found } = markSupplementTaken(plan.supplementPlan, supplementId);

  if (!found) {
    return res.status(404).json({ message: 'Supplement not found in plan' });
  }

  plan.supplementPlan = updatedPlan;
  plan.updatedAt = new Date();
  await plan.save();

  return res.json(sanitizePlan(plan));
});

module.exports = router;
