import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hotelierSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImageName: {
    type: String
  },
  otp: {
    type: Number,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  otpExpiry: {
    type: Date,
  },
}, {
  timestamps: true
});

hotelierSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

hotelierSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Hotelier = mongoose.model('Hotelier', hotelierSchema);
export default Hotelier;
