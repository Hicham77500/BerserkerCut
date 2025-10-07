const { Schema, model } = require('mongoose');
const { defaultUserProfile } = require('../utils/defaults');

// Schéma pour les suppléments
const SupplementSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String,
      enum: ['pre_workout', 'post_workout', 'morning', 'evening', 'anytime', 'other'],
      default: 'anytime'
    },
    dosage: { type: String },
    timing: {
      type: String,
      enum: ['morning', 'pre_workout', 'post_workout', 'evening', 'with_meals'],
      default: 'with_meals'
    },
    quantity: { type: Number },
    unit: {
      type: String,
      enum: ['gram', 'capsule', 'milliliter'],
      default: 'gram'
    },
    available: { type: Boolean, default: true }
  },
  { _id: false }
);

// Préférences pour les suppléments
const SupplementPreferencesSchema = new Schema(
  {
    preferNatural: { type: Boolean, default: false },
    preferredTiming: {
      type: String,
      enum: ['morning', 'pre_workout', 'post_workout', 'evening'],
      default: 'morning'
    },
    budgetRange: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    excludedTypes: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    notes: { type: String }
  },
  { _id: false }
);

const HealthDataSourceSchema = new Schema(
  {
    type: { type: String, default: 'manual' },
    lastSyncDate: { type: Date },
    permissions: { type: [String], default: [] },
    isConnected: { type: Boolean, default: false },
  },
  { _id: false }
);

const HealthProfileSchema = new Schema(
  {
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },
    averageSleepHours: { type: Number, default: 8 },
    averageDailySteps: { type: Number },
    restingHeartRate: { type: Number },
    dataSource: { type: HealthDataSourceSchema, default: () => ({}) },
    lastUpdated: { type: Date, default: () => new Date() },
    isManualEntry: { type: Boolean, default: true },
  },
  { _id: false }
);

const TrainingDaySchema = new Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6 },
    type: {
      type: String,
      enum: ['strength', 'cardio', 'mixed', 'rest'],
      default: 'rest',
    },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'evening',
    },
    duration: { type: Number, default: 45 },
  },
  { _id: false }
);

const TrainingProfileSchema = new Schema(
  {
    trainingDays: { type: [TrainingDaySchema], default: [] },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    preferredTimeSlots: {
      type: [String],
      enum: ['morning', 'afternoon', 'evening'],
      default: ['evening'],
    },
  },
  { _id: false }
);



const SupplementProfileSchema = new Schema(
  {
    available: { type: [SupplementSchema], default: [] },
    preferences: { type: SupplementPreferencesSchema, default: () => ({}) },
  },
  { _id: false }
);

const UserProfileSchema = new Schema(
  {
    name: { type: String, default: '' },
    objective: {
      type: String,
      enum: ['cutting', 'recomposition', 'maintenance'],
      default: 'cutting',
    },
    allergies: { type: [String], default: [] },
    foodPreferences: { type: [String], default: [] },
    health: { type: HealthProfileSchema, default: () => ({}) },
    training: { type: TrainingProfileSchema, default: () => ({}) },
    supplements: { type: SupplementProfileSchema, default: () => ({}) },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: { type: String, required: true },
    profile: { type: UserProfileSchema, default: () => defaultUserProfile() },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.hashedPassword;
    return ret;
  },
});

const User = model('User', userSchema);

module.exports = User;
