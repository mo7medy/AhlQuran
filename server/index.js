import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Database Connection ---
// For demo purposes, we log if MONGO_URI is missing, but server will start.
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI not found in .env file. Database features will fail.");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
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

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      displayName: name,
      email,
      password: hashedPassword,
      role,
      avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=${role === 'student' ? '0D9488' : '0F172A'}&color=fff`,
      // Teacher specific fields (will be ignored by Mongo if role is student, usually)
      bio: role === 'teacher' ? bio : undefined,
      hourlyRate: role === 'teacher' ? hourlyRate : undefined,
      subjects: role === 'teacher' ? subjects : undefined,
    });

    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({ token, user: { 
      uid: user._id, 
      email: user.email, 
      displayName: user.displayName, 
      role: user.role, 
      avatarUrl: user.avatarUrl,
      // Teacher fields
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

// Get Current User (Load from Token)
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
    // Prevent updating password via this route
    delete updates.password;
    delete updates.email; // Usually require separate flow for email change

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

// Mock Teachers List (In production, this would query DB)
app.get('/api/teachers', async (req, res) => {
    // For now, return mock data or query Users where role='teacher'
    // This allows the app to work without populating DB first
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.json(teachers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));