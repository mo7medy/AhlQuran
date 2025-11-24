import React, { useState, useEffect, useRef } from 'react';
import { Ayah, Surah } from '../types';
import { fetchSurahList, fetchSurahDetails } from '../services/quranApi';
import { ChevronLeft, Play, Pause, Settings, Search, BookOpen, Volume2, Info, Loader2 } from 'lucide-react';

const MushafScreen = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(28);
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
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-30 sticky top-0 border-b border-gray-100">
        <button onClick={() => { setSelectedSurah(null); setPlayingAyah(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-gray-600">
          <ChevronLeft size={24} />
          <span className="hidden md:inline font-medium">Surah List</span>
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg text-gray-800">{selectedSurah.name}</h2>
          <p className="text-xs text-gray-500">{selectedSurah.englishName}</p>
        </div>
        <div className="flex gap-1">
            <button 
              onClick={toggleTafsir}
              className={`p-2 rounded-full transition-colors ${showTafsir ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-600'}`} 
              title="Toggle Tafsir"
            >
                <BookOpen size={20} />
            </button>
        </div>
      </div>

      {/* Mushaf Page */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-8">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full text-emerald-600">
              <Loader2 size={40} className="animate-spin mb-2" />
              <p className="text-sm font-medium">Loading Quran Data...</p>
           </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white shadow-md border border-gray-100 rounded-xl md:rounded-2xl p-4 md:p-12 min-h-[80vh]">
            
            {/* Bismillah */}
            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
              <div className="text-center mb-10 mt-2">
                 <span className="font-quran text-3xl text-gray-800 block mb-4">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
                 <div className="h-[1px] w-32 bg-amber-300 mx-auto opacity-50"></div>
              </div>
            )}
            
            {/* Quran Text Container */}
            <div className={`leading-[2.8] ${showTafsir ? 'space-y-8' : 'text-justify'} `} style={{ direction: 'rtl' }}>
               {ayahs.map((ayah) => (
                 <React.Fragment key={ayah.number}>
                    {showTafsir ? (
                      // Tafsir Mode: List View
                      <div className="border-b border-gray-50 pb-6 mb-6 last:border-0">
                         <div className="flex gap-4 items-start">
                             <button 
                                onClick={() => toggleAudio(ayah)}
                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-colors mt-2 ${playingAyah === ayah.number ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-emerald-600'}`}
                             >
                               {playingAyah === ayah.number ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                             </button>
                             <div className="flex-1">
                                <p className="font-quran text-3xl text-gray-800 mb-4 leading-loose">{ayah.text}</p>
                                <div className="text-base text-gray-600 font-sans ltr text-left bg-gray-50 p-4 rounded-lg border border-gray-100">
                                   <p className="font-semibold text-emerald-800 mb-1 text-xs uppercase tracking-wider">Translation</p>
                                   <p className="mb-3">{ayah.translation}</p>
                                   <div className="h-[1px] bg-gray-200 w-full my-3"></div>
                                   <p className="font-semibold text-amber-700 mb-1 text-xs uppercase tracking-wider">Tafsir (Al-Muyassar)</p>
                                   <p className="text-right font-serif text-gray-700 leading-relaxed" dir="rtl">{ayah.tafsir}</p>
                                </div>
                             </div>
                             <div className="shrink-0 pt-2">
                                <span className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-sm font-bold shadow-sm">
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
                          className={`font-quran cursor-pointer transition-colors duration-200 px-1 rounded decoration-emerald-200 decoration-2 select-text ${
                            playingAyah === ayah.number ? 'bg-emerald-100 text-emerald-900' : 'text-gray-800 hover:text-emerald-800'
                          }`}
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {ayah.text}
                        </span>
                        {/* Ayah End Marker */}
                        <span className="inline-flex items-center justify-center min-w-[30px] h-[30px] mx-1 bg-amber-50 rounded-full text-sm text-amber-800 border border-amber-300 font-bold select-none align-middle mt-1 shadow-sm font-sans"
                          style={{ transform: 'translateY(5px)' }}
                        >
                          {ayah.numberInSurah}
                        </span>
                      </>
                    )}
                 </React.Fragment>
               ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
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
    <div className="flex flex-col h-full bg-white md:bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm md:shadow-none">
        <h1 className="text-3xl font-bold mb-4 text-emerald-900 font-serif">Noble Quran</h1>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by surah name or number..." 
            className="w-full bg-gray-50 md:bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 md:p-6">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <Loader2 size={32} className="animate-spin mb-2" />
               <p>Loading Surahs...</p>
            </div>
        ) : (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-4">
                {filtered.map((surah) => (
                <button 
                    key={surah.number} 
                    onClick={() => onSelect(surah)}
                    className="w-full p-4 flex items-center justify-between bg-white hover:bg-emerald-50 md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:hover:shadow-md transition-all group text-left border-b border-gray-50 md:border-b-gray-100 last:border-0"
                >
                    <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-emerald-700 font-bold text-lg rotate-45 transition-colors shadow-inner">
                        <span className="-rotate-45">{surah.number}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-emerald-900">{surah.englishName}</h3>
                        <p className="text-xs text-gray-500">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                    </div>
                    </div>
                    <div className="text-right">
                        <span className="font-quran text-2xl text-emerald-800/80 group-hover:text-emerald-900">{surah.name}</span>
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
