const { Schema, model } = require('mongoose');

const dailyPlanSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    dayType: {
      type: String,
      enum: ['training', 'rest', 'cheat'],
      default: 'training',
    },
    nutritionPlan: { type: Schema.Types.Mixed, required: true },
    supplementPlan: { type: Schema.Types.Mixed, required: true },
    dailyTip: { type: String },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  },
  {
    minimize: false,
  }
);

dailyPlanSchema.pre('save', function setUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

dailyPlanSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const DailyPlan = model('DailyPlan', dailyPlanSchema);

module.exports = DailyPlan;
