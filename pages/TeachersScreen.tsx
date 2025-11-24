import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TEACHERS } from '../services/mockData';
import { Star, Clock, Video, Filter } from 'lucide-react';

const TeachersScreen = () => {
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full">
      <div className="p-4 bg-white sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Find a Teacher</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Tajweed', 'Hifz', 'Fiqh', 'Arabic'].map(tag => (
            <button 
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tag ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto pb-24">
        {MOCK_TEACHERS.map((teacher) => (
          <div 
            key={teacher.uid} 
            onClick={() => navigate(`/teachers/${teacher.uid}`)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex gap-4">
              <img src={teacher.avatarUrl} alt={teacher.displayName} className="w-16 h-16 rounded-xl object-cover bg-gray-200 group-hover:scale-105 transition-transform" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">{teacher.displayName}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-700 text-xs font-bold">
                        <Star size={10} className="fill-amber-500 text-amber-500" />
                        {teacher.rating}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{teacher.subjects.join(' • ')}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} /> Flexible</span>
                    <span className="flex items-center gap-1"><Video size={12} /> Zoom/In-app</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                <div className="text-emerald-700 font-bold">
                    ${teacher.hourlyRate}<span className="text-gray-400 text-xs font-normal">/hr</span>
                </div>
                <button className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 hover:text-white transition-all">
                    View Profile
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachersScreen;