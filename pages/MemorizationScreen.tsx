import React, { useState, useEffect } from 'react';
import { fetchSurahList, fetchSurahDetails } from '../services/quranApi';
import { Surah, Ayah } from '../types';
import { Eye, EyeOff, CheckCircle, RefreshCcw, ChevronDown, ChevronRight, Book, Loader2 } from 'lucide-react';

const MemorizationScreen = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1); // Default Al-Fatiha
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isHidden, setIsHidden] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Load Surah List
  useEffect(() => {
    fetchSurahList().then(setSurahs);
  }, []);

  // Load Ayahs when selection changes
  useEffect(() => {
    const loadAyahs = async () => {
      setLoading(true);
      const data = await fetchSurahDetails(selectedSurahId);
      setAyahs(data);
      setCompletedCount(0);
      setLoading(false);
    };
    loadAyahs();
  }, [selectedSurahId]);

  const progressPercentage = ayahs.length > 0 ? Math.round((completedCount / ayahs.length) * 100) : 0;

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto pb-24 h-full">
      <div className="bg-emerald-800 p-6 rounded-b-3xl shadow-md sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-white mb-4">Hifz Test</h1>
        
        {/* Selector */}
        <div className="relative mb-6">
            <select 
                value={selectedSurahId}
                onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                className="w-full appearance-none bg-emerald-900/50 text-white border border-emerald-600/50 rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
            >
                {surahs.map(s => (
                    <option key={s.number} value={s.number} className="text-gray-900">
                        {s.number}. {s.englishName} - {s.name}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200 pointer-events-none" size={20} />
        </div>
        
        <div className="flex justify-between items-center bg-emerald-900/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-center">
                <span className="block text-2xl font-bold text-white">{completedCount}</span>
                <span className="text-xs text-emerald-300">Recited</span>
            </div>
            <div className="h-8 w-[1px] bg-emerald-700"></div>
            <div className="text-center">
                <span className="block text-2xl font-bold text-amber-400">{progressPercentage}%</span>
                <span className="text-xs text-emerald-300">Complete</span>
            </div>
            <button 
                onClick={() => setIsHidden(!isHidden)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white p-3 rounded-full transition-colors shadow-lg shadow-emerald-900/20"
                title={isHidden ? "Show Text" : "Hide Text"}
            >
                {isHidden ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p>Loading Surah...</p>
             </div>
        ) : (
            ayahs.map((ayah) => (
            <div key={ayah.number} className={`bg-white p-5 rounded-xl shadow-sm border transition-all duration-300 ${isHidden ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-4">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                        {ayah.numberInSurah}
                    </span>
                    <button 
                        onClick={() => {}} // Placeholder for reset single ayah
                        className="text-gray-300 hover:text-emerald-500"
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
                
                <p 
                className={`font-quran text-3xl text-right leading-[2.5] transition-all duration-500 select-none ${
                    isHidden ? 'blur-md opacity-20 hover:blur-sm hover:opacity-60 cursor-help' : 'text-gray-800'
                }`}
                style={{ direction: 'rtl' }}
                >
                {ayah.text}
                </p>

                {isHidden && (
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-emerald-100/50">
                        <button className="text-xs bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors">
                            Missed
                        </button>
                        <button 
                            onClick={() => setCompletedCount(p => Math.min(p + 1, ayahs.length))}
                            className="text-xs bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-200 transition-colors"
                        >
                            <CheckCircle size={14} /> Correct
                        </button>
                    </div>
                )}
            </div>
            ))
        )}
        
        {!loading && ayahs.length > 0 && (
             <div className="text-center py-8 text-gray-400 text-sm">
                End of Surah
             </div>
        )}
      </div>
    </div>
  );
};

export default MemorizationScreen;
