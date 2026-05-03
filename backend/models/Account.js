const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // ADD THIS LINE
    profileImage: {
      type: String,
      default: '', 
    },
    notificationTime: {
      hours: { type: Number, default: 8 }, // Default to 8 AM
      minutes: { type: Number, default: 0 }
    },
    hasSetPreferences: { type: Boolean, default: false },
    // 💡 NEW FIELDS FOR OTP
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true },
  
);
module.exports = mongoose.model('Account', accountSchema);
