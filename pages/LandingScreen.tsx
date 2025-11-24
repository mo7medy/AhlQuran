import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Users, BookOpen, ChevronRight, Globe, Star, PlayCircle, CheckCircle, GraduationCap } from 'lucide-react';

const LandingScreen = () => {
  const navigate = useNavigate();

  const handleGetStarted = (role: 'student' | 'teacher') => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
              <Sparkles size={20} className="text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">QuranMemo</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#mentors" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Mentors</a>
            <button onClick={() => navigate('/auth')} className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors">Sign In</button>
            <button onClick={() => handleGetStarted('student')} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#FDFCF8]">
           <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-50 rounded-full blur-[100px] opacity-60"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-amber-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
             </span>
             <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">The #1 Platform for Hifz & Studies</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Master the Quran <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">With Expert Guidance.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with certified tutors, track your memorization with AI tools, and join a global community dedicated to the Book of Allah.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <button 
                onClick={() => handleGetStarted('student')}
                className="w-full md:w-auto group relative px-8 py-5 bg-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900"></div>
                <div className="relative flex items-center justify-center gap-3">
                    <BookOpen className="text-teal-400" size={24} />
                    <div className="text-left">
                        <span className="block text-white font-bold text-lg leading-none">I'm a Student</span>
                        <span className="block text-slate-400 text-xs font-medium mt-1">Start learning today</span>
                    </div>
                    <ChevronRight className="text-slate-500 group-hover:text-white transition-colors ml-2" size={20} />
                </div>
            </button>

            <button 
                onClick={() => handleGetStarted('teacher')}
                className="w-full md:w-auto group px-8 py-5 bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:border-teal-200"
            >
                <div className="flex items-center justify-center gap-3">
                    <ShieldCheck className="text-teal-600" size={24} />
                     <div className="text-left">
                        <span className="block text-slate-900 font-bold text-lg leading-none">I'm a Teacher</span>
                        <span className="block text-slate-500 text-xs font-medium mt-1">Apply to teach</span>
                    </div>
                </div>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-slate-200/60 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2">
                <Users size={20} className="text-slate-400" />
                <span className="font-bold text-slate-600">10k+ Students</span>
             </div>
             <div className="flex items-center gap-2">
                <Globe size={20} className="text-slate-400" />
                <span className="font-bold text-slate-600">50+ Countries</span>
             </div>
             <div className="flex items-center gap-2">
                <Star size={20} className="text-slate-400" />
                <span className="font-bold text-slate-600">4.9/5 Rating</span>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white" id="features">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to succeed</h2>
                <p className="text-slate-500 text-lg">Whether you are memorizing for the first time or reviewing, our tools adapt to your journey.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-teal-100 transition-colors">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-teal-600">
                        <BookOpen size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Interactive Mushaf</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Read, listen, and understand with our state-of-the-art Quran reader featuring tafsir and audio playback.
                    </p>
                </div>

                {/* Feature 2 - Highlighted */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-teal-400 border border-white/10">
                        <GraduationCap size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Smart Hifz Tracker</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Track your memorization progress, identify weak spots, and get scheduled revision reminders.
                    </p>
                </div>

                 {/* Feature 3 */}
                 <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100/50 hover:border-amber-200 transition-colors">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-amber-600">
                        <Users size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Tutors</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Book 1-on-1 sessions with qualified Sheikhs and Ustadhas from around the world.
                    </p>
                </div>
            </div>
         </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-[#FDFCF8] border-t border-slate-200">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Ready to start your journey?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => handleGetStarted('student')} className="w-full sm:w-auto bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
                    Create Student Account
                </button>
                 <button onClick={() => handleGetStarted('teacher')} className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
                    Apply as Teacher
                </button>
            </div>
            <p className="mt-8 text-slate-400 text-sm font-medium">© 2024 QuranMemo. All rights reserved.</p>
         </div>
      </section>
    </div>
  );
};

export default LandingScreen;