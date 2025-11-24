import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, ChevronRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto no-scrollbar pb-24">
      {/* Header Section */}
      <div className="bg-emerald-800 text-white p-6 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-emerald-200 text-sm">Assalamu Alaikum,</p>
              <h2 className="text-2xl font-bold">{user?.displayName?.split(' ')[0]}</h2>
            </div>
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt="Profile" className="w-12 h-12 rounded-full border-2 border-emerald-400" />
            )}
          </div>

          {/* Daily Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Ayah of the Day</span>
              <span className="text-emerald-200 text-xs">Al-Baqarah 2:286</span>
            </div>
            <p className="font-quran text-right text-xl mb-3 leading-loose">
              لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا
            </p>
            <p className="text-sm text-emerald-100 opacity-90">
              "Allah does not burden a soul beyond that it can bear..."
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-6">
        
        {/* Progress Section */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-gray-800 text-lg">Your Progress</h3>
            <span className="text-emerald-600 text-sm font-medium">View All</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-emerald-500" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <span className="absolute text-sm font-bold text-gray-700">60%</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Juz 1 Revision</h4>
              <p className="text-xs text-gray-500 mb-2">Last active: 2 hours ago</p>
              <button onClick={() => navigate('/mushaf')} className="bg-emerald-50 text-emerald-700 text-xs py-1.5 px-3 rounded-full font-medium hover:bg-emerald-100 transition-colors">
                Continue
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/mushaf')} className="bg-emerald-50 p-4 rounded-2xl flex flex-col items-start gap-3 hover:bg-emerald-100 transition-colors">
            <div className="bg-emerald-100 p-2 rounded-full">
              <BookOpen className="text-emerald-600" size={20} />
            </div>
            <span className="font-semibold text-gray-800">Read Quran</span>
          </button>
          <button onClick={() => navigate('/courses')} className="bg-amber-50 p-4 rounded-2xl flex flex-col items-start gap-3 hover:bg-amber-100 transition-colors">
            <div className="bg-amber-100 p-2 rounded-full">
              <PlayCircle className="text-amber-600" size={20} />
            </div>
            <span className="font-semibold text-gray-800">Islamic Courses</span>
          </button>
        </section>

        {/* Upcoming Session */}
        <section>
          <h3 className="font-bold text-gray-800 text-lg mb-3">Upcoming Session</h3>
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 text-indigo-600 rounded-xl p-3 flex flex-col items-center min-w-[3.5rem]">
                <span className="text-xs font-bold uppercase">Oct</span>
                <span className="text-lg font-bold">12</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-indigo-900">Tajweed Correction</h4>
                <p className="text-sm text-indigo-600 mb-2">with Sheikh Ahmed</p>
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <Calendar size={12} />
                  <span>10:00 AM - 11:00 AM</span>
                </div>
              </div>
              <button className="bg-indigo-600 text-white p-2 rounded-full shadow-md shadow-indigo-200">
                 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomeScreen;