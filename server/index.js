import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable CORS for all domains
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Database Connection ---
const connectDB = async () => {
  // Check if we are already connected (Vercel hot-loading optimization)
  if (mongoose.connection.readyState >= 1) return;

  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI not found.");
    } else {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB Connected');
    }
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
  }
};
connectDB();

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, bio, hourlyRate, subjects } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      displayName: name,
      email,
      password: hashedPassword,
      role,
      avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=${role === 'student' ? '0D9488' : '0F172A'}&color=fff`,
      bio: role === 'teacher' ? bio : undefined,
      hourlyRate: role === 'teacher' ? hourlyRate : undefined,
      subjects: role === 'teacher' ? subjects : undefined,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({ token, user: { 
      uid: user._id, 
      email: user.email, 
      displayName: user.displayName, 
      role: user.role, 
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      hourlyRate: user.hourlyRate,
      subjects: user.subjects
    }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({ token, user: { 
      uid: user._id, 
      email: user.email, 
      displayName: user.displayName, 
      role: user.role, 
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      hourlyRate: user.hourlyRate,
      subjects: user.subjects
    }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ 
      uid: user._id, 
      email: user.email, 
      displayName: user.displayName, 
      role: user.role, 
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      hourlyRate: user.hourlyRate,
      subjects: user.subjects,
      memorizedAyahs: user.memorizedAyahs
    });
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Update Profile
app.put('/api/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const updates = req.body;
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(decoded.id, { $set: updates }, { new: true }).select('-password');

    res.json({ 
        uid: user._id, 
        email: user.email, 
        displayName: user.displayName, 
        role: user.role, 
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        hourlyRate: user.hourlyRate,
        subjects: user.subjects,
        memorizedAyahs: user.memorizedAyahs
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server (Only if not in Vercel/Serverless environment)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export for Vercel
export default app;