import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, Eye, EyeOff, Check, BookOpen, GraduationCap, DollarSign, User, Mail, Lock, ChevronRight } from 'lucide-react';

const AuthScreen = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    hourlyRate: '15',
    subjects: [] as string[]
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'teacher' || roleParam === 'student') {
        setRole(roleParam);
        setIsSignup(true); // Default to signup if coming from landing page buttons
    }
  }, [searchParams]);

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.includes(subject) 
            ? prev.subjects.filter(s => s !== subject)
            : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login(role, formData);
    navigate('/dashboard');
    setLoading(false);
  };

  const availableSubjects = ['Tajweed', 'Hifz', 'Arabic', 'Fiqh', 'Seerah', 'Hadith'];

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-50 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-50 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100">
                <ChevronLeft size={18} /> Back
            </button>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center p-6 z-10 my-12">
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-600/20 rotate-3">
                    <Sparkles size={32} className="text-white fill-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                    {isSignup ? `Join as ${role === 'teacher' ? 'Teacher' : 'Student'}` : 'Welcome Back'}
                </h1>
                <p className="text-slate-500">
                    {isSignup ? 'Create your account to get started' : 'Enter your details to access your account'}
                </p>
            </div>

            {/* Role Switcher (Visible only if Signup or generic Login) */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-8 relative">
                <button 
                    onClick={() => setRole('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${role === 'student' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <GraduationCap size={18} /> Student
                </button>
                <button 
                    onClick={() => setRole('teacher')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${role === 'teacher' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BookOpen size={18} /> Teacher
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {isSignup && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                required 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder={role === 'teacher' ? "Sheikh Abdullah" : "Abdullah Ahmed"}
                                className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="you@example.com"
                            className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Teacher Specific Fields */}
                {isSignup && role === 'teacher' && (
                    <div className="space-y-5 pt-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <BookOpen size={16} className="text-teal-600" /> Teaching Profile
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Hourly Rate ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="number" 
                                            required 
                                            value={formData.hourlyRate}
                                            onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
                                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bio & Qualifications</label>
                                    <textarea 
                                        required 
                                        value={formData.bio}
                                        onChange={e => setFormData({...formData, bio: e.target.value})}
                                        placeholder="I have an Ijazah in Hafs from..."
                                        rows={3}
                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subjects</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSubjects.map(sub => (
                                            <button
                                                key={sub}
                                                type="button"
                                                onClick={() => handleSubjectToggle(sub)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                    formData.subjects.includes(sub)
                                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300'
                                                }`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {isSignup ? 'Create Account' : 'Sign In'}
                            {!loading && <ChevronRight size={20} />}
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button 
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-slate-500 font-medium hover:text-teal-600 transition-colors"
                >
                    {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AuthScreen;