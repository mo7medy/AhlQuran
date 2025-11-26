import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  avatarUrl: { type: String },
  memorizedAyahs: { type: Number, default: 0 },
  
  // Teacher Specific Fields
  bio: { type: String },
  hourlyRate: { type: Number },
  subjects: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);