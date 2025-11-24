import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Calendar, ChevronRight, PlayCircle, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-[#FDFCF8] overflow-y-auto no-scrollbar pb-32">
      {/* Header Section */}
      <header className="px-6 pt-8 pb-6 md:px-10 md:pt-12">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-500 font-medium mb-1">{t('home.greeting')},</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {user?.displayName?.split(' ')[0]}
            </h1>
          </div>
          <div className="hidden md:block">
             <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm text-sm font-bold text-slate-600">
               <Award className="text-amber-500" size={18} /> {t('home.premium')}
             </span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="px-6 md:px-10 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
        
        {/* Featured Card (Ayah) */}
        <div className="md:col-span-8 relative group overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:opacity-30 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative p-8 md:p-10 z-10">
                <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-teal-300 uppercase tracking-wider border border-white/5">
                        {t('home.daily_inspiration')}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">Al-Baqarah 2:286</span>
                </div>
                
                <p className="font-quran text-right text-2xl md:text-4xl mb-6 leading-loose md:leading-[2.2] text-white">
                    لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا
                </p>
                
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl ltr:text-left rtl:text-right">
                    "Allah does not burden a soul beyond that it can bear..."
                </p>

                <div className="mt-8 flex gap-3">
                    <button onClick={() => navigate('/mushaf')} className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                        {t('home.read_surah')}
                    </button>
                    <button className="px-6 py-3 rounded-xl font-bold text-sm text-white border border-white/20 hover:bg-white/10 transition-colors">
                        {t('home.share')}
                    </button>
                </div>
            </div>
        </div>

        {/* Progress Card */}
        <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:border-teal-100 transition-colors">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                        <TrendingUp size={24} className={isRTL ? "rotate-180" : ""} />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">60%</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{t('home.hifz_progress')}</h3>
                <p className="text-sm text-slate-400">{t('home.keep_going')}</p>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-6">
                <div className="bg-teal-500 h-full w-[60%] rounded-full"></div>
            </div>
            
            <button onClick={() => navigate('/memorize')} className="mt-6 w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-900 hover:text-white transition-all">
                {t('home.continue_revision')}
            </button>
        </div>

        {/* Quick Actions Row */}
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: t('nav.quran'), icon: BookOpen, color: 'bg-indigo-50 text-indigo-600', route: '/mushaf' },
                { label: t('nav.teachers'), icon: Calendar, color: 'bg-emerald-50 text-emerald-600', route: '/teachers' },
                { label: t('nav.courses'), icon: PlayCircle, color: 'bg-amber-50 text-amber-600', route: '/courses' },
                { label: t('nav.memorize'), icon: Award, color: 'bg-rose-50 text-rose-600', route: '/memorize' },
            ].map((action, idx) => (
                <button 
                    key={idx}
                    onClick={() => navigate(action.route)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
                >
                    <div className={`p-4 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon size={24} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{action.label}</span>
                </button>
            ))}
        </div>

        {/* Upcoming Session */}
        <div className="md:col-span-12">
          <div className="bg-white rounded-[2rem] p-2 ltr:pr-6 rtl:pl-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="bg-slate-900 text-white p-6 rounded-[1.5rem] text-center min-w-[5rem]">
                    <span className="block text-xs font-bold uppercase opacity-60">Oct</span>
                    <span className="block text-2xl font-bold">12</span>
                </div>
                <div>
                    <h4 className="font-bold text-lg text-slate-900">{t('home.upcoming_session')}</h4>
                    <p className="text-slate-500 text-sm">{t('home.with')} Sheikh Ahmed • 10:00 AM</p>
                </div>
             </div>
             <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-teal-600 hover:text-white transition-all">
                 <ChevronRight size={20} className={isRTL ? "rotate-180" : ""} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;