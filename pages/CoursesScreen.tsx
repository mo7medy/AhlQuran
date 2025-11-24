import React from 'react';
import { MOCK_COURSES } from '../services/mockData';
import { Play } from 'lucide-react';

const CoursesScreen = () => {
  return (
    <div className="flex-1 bg-gray-50 pb-24 overflow-y-auto">
      <div className="p-6 bg-emerald-900 text-white">
        <h1 className="text-2xl font-bold mb-2">Learning Path</h1>
        <p className="text-emerald-200 text-sm">Expand your knowledge with structured courses</p>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        {MOCK_COURSES.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group">
            <div className="h-32 bg-gray-200 relative">
                <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play size={20} className="text-emerald-600 fill-emerald-600 ml-1" />
                    </div>
                </div>
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                    {course.category}
                </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-1">{course.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{course.completedLessons} / {course.lessonsCount} Lessons Completed</p>
              
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(course.completedLessons / course.lessonsCount) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesScreen;