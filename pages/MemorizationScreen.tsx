
import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahList, fetchSurahDetails } from '../services/quranApi';
import { Surah, Ayah } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Eye, EyeOff, Play, Pause, RotateCcw, ChevronLeft, ArrowRight, 
  Settings, CheckCircle, AlertTriangle, Mic, Square, Loader2, Wand2, BookOpen
} from 'lucide-react';

type SessionState = 'setup' | 'active' | 'summary';
type AyahStatus = 'locked' | 'current' | 'correct' | 'mistake' | 'revealed';

interface AyahProgress {
    ayahNumber: number;
    status: AyahStatus;
    htmlContent?: string; // For error highlighting
}

const MemorizationScreen = () => {
  // Data State
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Setup State
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(10);
  const [sessionState, setSessionState] = useState<SessionState>('setup');

  // Session State
  const [sessionAyahs, setSessionAyahs] = useState<Ayah[]>([]);
  const [progress, setProgress] = useState<AyahProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Interaction State
  const [isPeeking, setIsPeeking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAyahRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const data = await fetchSurahList();
        setSurahs(data);
        if (data.length > 0) setSelectedSurah(data[0]);
        setLoading(false);
    };
    loadData();
  }, []);

  // Fetch Ayahs when Surah changes
  useEffect(() => {
    if (selectedSurah) {
        const loadAyahs = async () => {
            setLoading(true);
            const data = await fetchSurahDetails(selectedSurah.number);
            setAyahs(data);
            setRangeStart(1);
            setRangeEnd(Math.min(data.length, 10)); // Default first 10
            setLoading(false);
        };
        loadAyahs();
    }
  }, [selectedSurah]);

  // Auto-scroll to current ayah
  useEffect(() => {
      if (sessionState === 'active' && activeAyahRef.current) {
          activeAyahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [currentIndex, sessionState]);

  const handleStartSession = () => {
    const filtered = ayahs.filter(a => a.numberInSurah >= rangeStart && a.numberInSurah <= rangeEnd);
    setSessionAyahs(filtered);
    
    // Initialize Progress: First is 'current', rest 'locked'
    const initialProgress = filtered.map((a, idx) => ({
        ayahNumber: a.numberInSurah,
        status: idx === 0 ? 'current' : 'locked'
    } as AyahProgress));
    
    setProgress(initialProgress);
    setCurrentIndex(0);
    setSessionState('active');
  };

  // --- AI Listening Logic ---

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            analyzeRecitation(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Mic Error:", err);
        alert("Microphone access needed.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const analyzeRecitation = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
        const apiKey = process.env.API_KEY || '';
        if (!apiKey) throw new Error("API Key not found");
        const ai = new GoogleGenAI({ apiKey });

        const currentAyah = sessionAyahs[currentIndex];
        const base64Audio = await blobToBase64(audioBlob);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType: "audio/webm", data: base64Audio } },
                        { text: `
                            Reciter is reciting Surah ${selectedSurah?.englishName}, Ayah ${currentAyah.numberInSurah}.
                            Correct Text: "${currentAyah.text}"
                            
                            Task:
                            1. Strictly compare recitation to the Arabic text.
                            2. If > 90% accurate (minor tajweed ignored), return isCorrect: true.
                            3. If wrong/missing words, return isCorrect: false.
                            4. Return 'htmlContent': The exact Arabic text. Wrap WRONG/MISSED words in <span style="color:#ef4444; text-decoration: underline;">WORD</span>.
                        `}
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: { type: Type.BOOLEAN },
                        htmlContent: { type: Type.STRING }
                    },
                    required: ["isCorrect", "htmlContent"]
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text);
            handleAiResult(result.isCorrect, result.htmlContent);
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("Analysis failed. Try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleAiResult = (isCorrect: boolean, htmlContent: string) => {
      const newProgress = [...progress];
      
      if (isCorrect) {
          // Mark current as correct
          newProgress[currentIndex] = { ...newProgress[currentIndex], status: 'correct', htmlContent: undefined };
          
          // Move to next if available
          if (currentIndex < sessionAyahs.length - 1) {
              const nextIndex = currentIndex + 1;
              newProgress[nextIndex] = { ...newProgress[nextIndex], status: 'current' };
              setCurrentIndex(nextIndex);
          } else {
              setSessionState('summary');
          }
      } else {
          // Mark as mistake
          newProgress[currentIndex] = { ...newProgress[currentIndex], status: 'mistake', htmlContent };
      }
      
      setProgress(newProgress);
  };

  const handleManualCorrect = () => {
      // Allow user to manually mark as correct if AI fails or they just want to read
      handleAiResult(true, "");
  };

  // --- Render ---

  if (loading && !selectedSurah) {
      return (
          <div className="flex items-center justify-center h-full bg-[#FDFCF8]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
      );
  }

  return (
    <div className="flex-1 bg-[#FDFCF8] flex flex-col h-full overflow-hidden relative font-sans">
      
      {/* HEADER */}
      <header className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-20 sticky top-0">
         <div className="flex items-center gap-3">
             {sessionState !== 'setup' && (
                 <button onClick={() => setSessionState('setup')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500">
                     <ChevronLeft size={24} />
                 </button>
             )}
             <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedSurah?.englishName}
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {sessionState === 'active' ? `Ayah ${sessionAyahs[currentIndex]?.numberInSurah}` : 'Memorization'}
                </p>
             </div>
         </div>
         {sessionState === 'active' && (
             <div className="flex items-center gap-2">
                 <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${(currentIndex / sessionAyahs.length) * 100}%` }}></div>
                 </div>
                 <span className="text-xs font-bold text-slate-400">{Math.round((currentIndex / sessionAyahs.length) * 100)}%</span>
             </div>
         )}
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto relative pb-32" ref={scrollContainerRef}>
        
        {/* SETUP VIEW */}
        {sessionState === 'setup' && (
            <div className="p-6 max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <BookOpen size={16} /> Select Surah
                    </label>
                    <select 
                        value={selectedSurah?.number}
                        onChange={(e) => {
                            const found = surahs.find(s => s.number === Number(e.target.value));
                            if (found) setSelectedSurah(found);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
                    >
                        {surahs.map(s => <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>)}
                    </select>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-teal-600" /> Target Range
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 mb-2 block">From</label>
                            <input 
                                type="number" 
                                min={1} 
                                max={ayahs.length}
                                value={rangeStart}
                                onChange={(e) => setRangeStart(Math.min(Number(e.target.value), rangeEnd))}
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-center font-bold text-xl text-slate-800"
                            />
                        </div>
                        <div className="text-slate-300 font-bold text-xl">-</div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 mb-2 block">To</label>
                            <input 
                                type="number" 
                                min={rangeStart} 
                                max={ayahs.length}
                                value={rangeEnd}
                                onChange={(e) => setRangeEnd(Math.max(Number(e.target.value), rangeStart))}
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-center font-bold text-xl text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleStartSession}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    Start Hifz <ArrowRight size={20} />
                </button>
            </div>
        )}

        {/* ACTIVE MUSHAF VIEW */}
        {sessionState === 'active' && (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {sessionAyahs.map((ayah, index) => {
                    const status = progress[index]?.status || 'locked';
                    const isCurrent = status === 'current' || status === 'mistake';
                    const isLocked = status === 'locked';
                    const isCorrect = status === 'correct';
                    const isMistake = status === 'mistake';
                    
                    // Dynamic classes for blur/reveal
                    let contentClass = "transition-all duration-700 font-quran text-3xl md:text-4xl leading-[2.6] text-center dir-rtl";
                    if (isLocked) contentClass += " blur-md opacity-20 select-none grayscale";
                    if (isCurrent && !isPeeking && !isMistake) contentClass += " blur-lg opacity-40 select-none"; 
                    if (isCurrent && isPeeking) contentClass += " blur-0 opacity-100 text-slate-800";
                    if (isCorrect) contentClass += " blur-0 opacity-100 text-teal-700";
                    if (isMistake) contentClass += " blur-0 opacity-100 text-slate-900";

                    return (
                        <div 
                            key={ayah.number}
                            ref={isCurrent ? activeAyahRef : null}
                            className={`relative p-6 rounded-[2rem] transition-all duration-500 border-2 ${
                                isCurrent ? 'bg-white border-teal-500 shadow-2xl shadow-teal-500/10 scale-105 z-10' 
                                : isCorrect ? 'bg-teal-50/50 border-transparent opacity-80'
                                : 'bg-transparent border-transparent opacity-50'
                            }`}
                        >
                             {/* Status Badge */}
                             <div className="absolute top-4 left-4">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                                    isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {ayah.numberInSurah}
                                </span>
                             </div>

                             {/* Content */}
                             <div className={contentClass}>
                                {isMistake && progress[index].htmlContent ? (
                                    <span dangerouslySetInnerHTML={{ __html: progress[index].htmlContent! }} />
                                ) : (
                                    ayah.text
                                )}
                             </div>

                             {/* Context Actions for Current Card */}
                             {isCurrent && (
                                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                                    <button 
                                        onMouseDown={() => setIsPeeking(true)}
                                        onMouseUp={() => setIsPeeking(false)}
                                        onTouchStart={() => setIsPeeking(true)}
                                        onTouchEnd={() => setIsPeeking(false)}
                                        className="bg-white text-slate-500 p-2 rounded-full shadow-lg border border-slate-100 hover:text-teal-600 active:scale-95 transition-all"
                                    >
                                        {isPeeking ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                    
                                    {isMistake && (
                                        <button 
                                            onClick={handleManualCorrect}
                                            className="bg-white text-green-600 p-2 rounded-full shadow-lg border border-green-100 hover:bg-green-50 active:scale-95 transition-all"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    )}
                                </div>
                             )}
                        </div>
                    );
                })}
                
                {/* Spacer for bottom bar */}
                <div className="h-32"></div>
            </div>
        )}

        {/* SUMMARY VIEW */}
        {sessionState === 'summary' && (
            <div className="flex flex-col items-center justify-center h-full p-6 animate-in zoom-in-95 duration-500 text-center">
                <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-teal-500/20">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">MashaAllah!</h2>
                <p className="text-slate-500 mb-8 max-w-xs">
                    You have successfully recited {sessionAyahs.length} Ayahs from {selectedSurah?.englishName}.
                </p>
                <button 
                    onClick={() => setSessionState('setup')}
                    className="w-full max-w-xs bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                    <RotateCcw size={18} /> New Session
                </button>
            </div>
        )}

      </main>

      {/* BOTTOM ACTION BAR (Active Only) */}
      {sessionState === 'active' && (
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent z-30 flex justify-center pb-safe">
            <div className="flex items-center gap-6">
                
                {isRecording ? (
                    <button 
                        onClick={stopRecording}
                        className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-500/40 animate-pulse scale-110"
                    >
                        <Square size={32} fill="currentColor" />
                    </button>
                ) : isAnalyzing ? (
                    <div className="w-20 h-20 bg-white border-4 border-indigo-100 rounded-full flex flex-col items-center justify-center shadow-xl animate-bounce">
                        <Wand2 className="text-indigo-600" size={24} />
                    </div>
                ) : (
                    <button 
                        onClick={startRecording}
                        className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Mic size={32} className="group-hover:text-teal-400 transition-colors" />
                    </button>
                )}
            </div>
            
            {/* Helper Text */}
            <div className="absolute bottom-10 right-8 md:right-auto md:left-2/3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">
                {isRecording ? "Listening..." : isAnalyzing ? "Checking..." : "Tap to Recite"}
            </div>
        </div>
      )}

    </div>
  );
};

export default MemorizationScreen;
