import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TEACHERS } from '../services/mockData';
import { Star, Clock, Video, Filter, ChevronDown } from 'lucide-react';

const TeachersScreen = () => {
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 bg-[#FDFCF8] flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <div className="px-6 py-6 bg-[#FDFCF8]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mentors</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50">
                <Filter size={16} /> Filters
            </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Tajweed', 'Hifz', 'Fiqh', 'Arabic'].map(tag => (
            <button 
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                filter === tag 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-24 overflow-y-auto custom-scrollbar space-y-4">
        {MOCK_TEACHERS.map((teacher) => (
          <div 
            key={teacher.uid} 
            onClick={() => navigate(`/teachers/${teacher.uid}`)}
            className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex gap-5">
              <div className="relative">
                <img src={teacher.avatarUrl} alt={teacher.displayName} className="w-20 h-20 rounded-2xl object-cover bg-slate-100" />
                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                   <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-slate-900 truncate pr-2">{teacher.displayName}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 text-xs font-bold border border-amber-100">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        {teacher.rating}
                    </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-3 truncate">{teacher.bio}</p>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {teacher.subjects.slice(0, 3).map(sub => (
                        <span key={sub} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            {sub}
                        </span>
                    ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-slate-900 font-bold text-lg">
                    ${teacher.hourlyRate}<span className="text-slate-400 text-xs font-medium">/hr</span>
                </div>
                <div className="flex gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Clock size={12} /> Avail. Today</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachersScreen;