import React, { useState, useEffect, useRef } from 'react';
import { Ayah, Surah } from '../types';
import { fetchSurahList, fetchSurahDetails } from '../services/quranApi';
import { ChevronLeft, Play, Pause, Search, BookOpen, Loader2, ArrowRight } from 'lucide-react';

const MushafScreen = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(32);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [showTafsir, setShowTafsir] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initial Load: Fetch List
  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      const data = await fetchSurahList();
      setSurahs(data);
      setLoading(false);
    };
    loadSurahs();
  }, []);

  // Fetch Details on Select
  useEffect(() => {
    if (selectedSurah) {
      const loadDetails = async () => {
        setLoading(true);
        const data = await fetchSurahDetails(selectedSurah.number);
        setAyahs(data);
        setLoading(false);
      };
      loadDetails();
    }
  }, [selectedSurah]);

  const toggleAudio = (ayah: Ayah) => {
    if (playingAyah === ayah.number) {
      audioRef.current?.pause();
      setPlayingAyah(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (ayah.audio) {
        audioRef.current = new Audio(ayah.audio);
        audioRef.current.play();
        setPlayingAyah(ayah.number);
        audioRef.current.onended = () => setPlayingAyah(null);
      }
    }
  };

  const toggleTafsir = () => setShowTafsir(!showTafsir);

  if (!selectedSurah) {
    return <SurahList surahs={surahs} loading={loading} onSelect={setSelectedSurah} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#faf7f0] relative">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-30 sticky top-0 border-b border-slate-100">
        <button onClick={() => { setSelectedSurah(null); setPlayingAyah(null); }} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <div className="text-center">
          <h2 className="font-bold text-lg text-slate-900">{selectedSurah.name}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedSurah.englishName}</p>
        </div>
        
        <div className="flex gap-2">
            <button 
              onClick={toggleTafsir}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${showTafsir ? 'bg-teal-100 text-teal-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`} 
              title="Toggle Tafsir"
            >
                <BookOpen size={20} />
            </button>
        </div>
      </div>

      {/* Mushaf Page */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-10 bg-[#FDFCF8]">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full text-teal-600">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Text...</p>
           </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-6 md:p-16 min-h-[80vh] relative border border-slate-50">
            
            {/* Bismillah */}
            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
              <div className="text-center mb-12 mt-4">
                 <span className="font-quran text-3xl text-slate-800 block mb-6">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
                 <div className="h-[2px] w-24 bg-amber-400 mx-auto rounded-full opacity-40"></div>
              </div>
            )}
            
            {/* Quran Text Container */}
            <div className={`leading-[2.8] ${showTafsir ? 'space-y-10' : 'text-justify'} `} style={{ direction: 'rtl' }}>
               {ayahs.map((ayah) => (
                 <React.Fragment key={ayah.number}>
                    {showTafsir ? (
                      // Tafsir Mode: List View
                      <div className="border-b border-slate-50 pb-8 mb-8 last:border-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex gap-6 items-start">
                             <button 
                                onClick={() => toggleAudio(ayah)}
                                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all mt-2 ${playingAyah === ayah.number ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200'}`}
                             >
                               {playingAyah === ayah.number ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                             </button>
                             
                             <div className="flex-1">
                                <p className="font-quran text-3xl md:text-4xl text-slate-800 mb-6 leading-[2.5]">{ayah.text}</p>
                                
                                <div className="text-base font-sans ltr text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                   <div className="flex items-center gap-2 mb-2">
                                     <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                                     <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Translation</p>
                                   </div>
                                   <p className="mb-6 text-slate-700 leading-relaxed text-lg">{ayah.translation}</p>
                                   
                                   <div className="flex items-center gap-2 mb-2">
                                     <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                                     <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Tafsir (Al-Muyassar)</p>
                                   </div>
                                   <p className="text-right font-serif text-slate-600 leading-relaxed text-lg" dir="rtl">{ayah.tafsir}</p>
                                </div>
                             </div>
                             
                             <div className="shrink-0 pt-3">
                                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold shadow-sm border border-amber-100/50">
                                  {ayah.numberInSurah}
                                </span>
                             </div>
                         </div>
                      </div>
                    ) : (
                      // Reading Mode: Paragraph View
                      <>
                        <span 
                          onClick={() => toggleAudio(ayah)}
                          className={`font-quran cursor-pointer transition-all duration-300 px-1 rounded-lg decoration-teal-200/50 decoration-2 select-text ${
                            playingAyah === ayah.number ? 'bg-teal-50 text-teal-800' : 'text-slate-800 hover:text-teal-700'
                          }`}
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {ayah.text}
                        </span>
                        {/* Ayah End Marker */}
                        <span className="inline-flex items-center justify-center min-w-[34px] h-[34px] mx-2 bg-[#FDFCF8] rounded-full text-xs text-amber-600 border border-amber-200 font-bold select-none align-middle mt-1 shadow-sm font-sans"
                          style={{ transform: 'translateY(8px)' }}
                        >
                          {ayah.numberInSurah}
                        </span>
                      </>
                    )}
                 </React.Fragment>
               ))}
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 text-center text-slate-400 text-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold">
              <BookOpen size={16} />
              <span>Sadaqallah Al-Adheem</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SurahList = ({ surahs, loading, onSelect }: { surahs: Surah[], loading: boolean, onSelect: (s: Surah) => void }) => {
  const [search, setSearch] = useState('');
  
  const filtered = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) || 
    s.name.includes(search) ||
    String(s.number).includes(search)
  );

  return (
    <div className="flex flex-col h-full bg-[#FDFCF8]">
      <div className="px-6 py-8 bg-[#FDFCF8] sticky top-0 z-20">
        <h1 className="text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">The Noble Quran</h1>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search surah..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
               <Loader2 size={40} className="animate-spin mb-4 text-teal-500" />
               <p className="font-bold tracking-widest text-sm">LOADING...</p>
            </div>
        ) : (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((surah) => (
                <button 
                    key={surah.number} 
                    onClick={() => onSelect(surah)}
                    className="group relative w-full p-5 flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-100 hover:-translate-y-1 transition-all duration-300 text-left"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 font-bold flex items-center justify-center text-sm group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            {surah.number}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">{surah.englishName}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{surah.englishNameTranslation}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-quran text-2xl text-slate-800 opacity-60 group-hover:opacity-100 transition-opacity">{surah.name}</span>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{surah.numberOfAyahs} Ayahs</p>
                    </div>
                </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MushafScreen;