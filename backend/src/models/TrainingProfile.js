const { Schema, model } = require('mongoose');

const trainingProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profile: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

trainingProfileSchema.index({ userId: 1 }, { unique: true });

const TrainingProfile = model('TrainingProfile', trainingProfileSchema);

module.exports = TrainingProfile;
