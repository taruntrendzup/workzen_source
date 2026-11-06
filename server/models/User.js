import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
    },
    emailVerificationLastSentAt: {
      type: Date,
      select: false,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    recoveryCode: {
      type: String,
      select: false,
    },
    recoveryCodeExpiresAt: {
      type: Date,
      select: false,
    },
    recoveryCodeLastSentAt: {
      type: Date,
      select: false,
    },
    recoveryCodeAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    accountCode: {
      type: String,
      select: false,
    },
    accountCodeExpiresAt: {
      type: Date,
      select: false,
    },
    accountCodeLastSentAt: {
      type: Date,
      select: false,
    },
    accountCodeAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    accountCodePurpose: {
      type: String,
      select: false,
    },
    pendingEmail: {
      type: String,
      select: false,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee',
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Team Member',
      trim: true,
    },
    hourlyRate: {
      type: Number,
      default: 40,
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
