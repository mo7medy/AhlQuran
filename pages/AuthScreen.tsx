import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, ShieldCheck } from 'lucide-react';

const AuthScreen = () => {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="flex-1 bg-emerald-900 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-30"></div>

      <div className="z-10 flex flex-col items-center w-full">
        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
          <Moon size={40} className="text-amber-400 fill-amber-400" />
        </div>
        
        <h1 className="text-3xl font-bold font-serif mb-2 text-center">QuranMemo</h1>
        <p className="text-emerald-100 text-center mb-12">Your companion for Hifz & Islamic Studies</p>

        <div className="w-full space-y-4">
          <button 
            onClick={() => login('student')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} />
            {isSignup ? 'Sign up as Student' : 'Login as Student'}
          </button>
          
          <button 
            onClick={() => login('teacher')}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-4 rounded-xl backdrop-blur-md transition-all active:scale-95"
          >
             {isSignup ? 'Apply as Teacher' : 'Login as Teacher'}
          </button>
        </div>

        <button 
          onClick={() => setIsSignup(!isSignup)}
          className="mt-8 text-sm text-emerald-200 hover:text-white underline decoration-emerald-500/50"
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;