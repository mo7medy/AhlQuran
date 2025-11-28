
import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahList, fetchSurahDetails } from '../services/quranApi';
import { Surah, Ayah } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Eye, EyeOff, Play, Pause, RotateCcw, ChevronLeft, ArrowRight, 
  Settings, CheckCircle, AlertTriangle, Mic, Square, Loader2, Wand2, BookOpen, ChevronRight, RefreshCw, XCircle
} from 'lucide-react';

type SessionState = 'setup' | 'active' | 'summary';
type WordStatus = 'hidden' | 'revealed' | 'correct' | 'wrong';

interface WordData {
    id: number;
    text: string;
    cleanText: string; // Text without diacritics for matching
    status: WordStatus;
}

interface AyahProgress {
    ayahNumber: number;
    words: WordData[];
    isCompleted: boolean;
}

// Utility to remove Tashkeel (Diacritics) for fuzzy matching
const removeDiacritics = (text: string) => {
    return text.normalize("NFD").replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
};

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
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null); // Browser native speech recognition
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
          setTimeout(() => {
            activeAyahRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
      }
  }, [currentIndex, sessionState]);

  const handleStartSession = () => {
    const filtered = ayahs.filter(a => a.numberInSurah >= rangeStart && a.numberInSurah <= rangeEnd);
    setSessionAyahs(filtered);
    
    // Initialize Progress: Split words
    const initialProgress = filtered.map((a) => ({
        ayahNumber: a.numberInSurah,
        isCompleted: false,
        words: a.text.split(' ').map((word, idx) => ({
            id: idx,
            text: word,
            cleanText: removeDiacritics(word),
            status: 'hidden' as WordStatus
        }))
    }));
    
    setProgress(initialProgress);
    setCurrentIndex(0);
    setSessionState('active');
  };

  // --- Real-Time Speech Matching ---
  
  const setupSpeechRecognition = () => {
    // @ts-ignore - SpeechRecognition is not standard in all TS lib versions yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Listen for Arabic

    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
        }
        
        setLiveTranscript(interimTranscript);
        matchSpeechToText(interimTranscript);
    };

    return recognition;
  };

  const matchSpeechToText = (transcript: string) => {
      // Fuzzy match transcript words to the hidden Ayah words
      const cleanTranscript = removeDiacritics(transcript);
      const transcriptWords = cleanTranscript.split(' ');
      
      setProgress(prev => {
          const newProgress = [...prev];
          const currentWords = newProgress[currentIndex].words;
          
          let updated = false;
          const updatedWords = currentWords.map(w => {
              // If already revealed or correct, skip
              if (w.status !== 'hidden') return w;

              // Check if any word in the transcript loosely matches this word
              // We check the last few words spoken to allow for flow
              const isMatch = transcriptWords.some(tw => {
                  // Allow for slight differences (e.g. ignoring Alef types)
                  const tNorm = tw.replace(/[أإآ]/g, 'ا');
                  const wNorm = w.cleanText.replace(/[أإآ]/g, 'ا');
                  return tNorm === wNorm || (wNorm.length > 3 && tNorm.includes(wNorm));
              });

              if (isMatch) {
                  updated = true;
                  return { ...w, status: 'revealed' as WordStatus };
              }
              return w;
          });

          if (updated) {
            newProgress[currentIndex] = { ...newProgress[currentIndex], words: updatedWords };
            return newProgress;
          }
          return prev;
      });
  };

  // --- Audio Recording & AI ---

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 1. Setup Media Recorder (For Gemini)
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/acc')) mimeType = 'audio/acc';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            analyzeRecitation(audioBlob, mimeType);
            stream.getTracks().forEach(track => track.stop());
        };

        // 2. Setup Speech Recognition (For Real-time Visuals)
        const recognition = setupSpeechRecognition();
        if (recognition) {
            recognition.start();
            speechRecognitionRef.current = recognition;
        }

        mediaRecorder.start();
        setIsRecording(true);
        setLiveTranscript('');
    } catch (err) {
        console.error("Mic Error:", err);
        alert("Microphone access needed. Please check permissions.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const analyzeRecitation = async (audioBlob: Blob, mimeType: string) => {
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
                        { inlineData: { mimeType: mimeType, data: base64Audio } },
                        { text: `
                            Reciter is reciting Surah ${selectedSurah?.englishName}, Ayah ${currentAyah.numberInSurah}.
                            Expected Text: "${currentAyah.text}"
                            
                            Task:
                            1. Strictly transcribe what was said.
                            2. Compare word-by-word with the Expected Text.
                            3. Return JSON 'results' array.
                            4. Each item: { "word": string (from expected text), "status": "correct" | "wrong" }.
                            5. If a word is NOT said, mark it "wrong".
                        `}
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        results: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    status: { type: Type.STRING, enum: ["correct", "wrong"] }
                                },
                                required: ["word", "status"]
                            }
                        }
                    },
                    required: ["results"]
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text);
            handleAiResult(result.results);
        }
    } catch (error) {
        console.error("AI Error:", error);
        // On error, reveal everything so user isn't stuck
        handleRevealAll();
    } finally {
        setIsAnalyzing(false);
        setLiveTranscript('');
    }
  };

  const handleAiResult = (results: { word: string, status: 'correct' | 'wrong' }[]) => {
      const newProgress = [...progress];
      const currentWords = newProgress[currentIndex].words;
      
      let allCorrect = true;

      const updatedWords = currentWords.map((w, idx) => {
          const aiRes = results[idx];
          // Use AI result if available, otherwise assume wrong if strict
          if (aiRes && aiRes.status === 'wrong') {
              allCorrect = false;
              return { ...w, status: 'wrong' as WordStatus };
          } else if (aiRes && aiRes.status === 'correct') {
              return { ...w, status: 'correct' as WordStatus };
          }
          // Fallback: If not in AI result but was revealed by Speech API, keep revealed?
          // No, let's reveal it as correct to be lenient if AI didn't explicitly flag it
          return w.status === 'revealed' ? { ...w, status: 'correct' as WordStatus } : w;
      });

      newProgress[currentIndex] = {
          ...newProgress[currentIndex],
          words: updatedWords,
          isCompleted: allCorrect
      };
      
      setProgress(newProgress);
      
      // Auto-advance if fully correct
      if (allCorrect) {
          setTimeout(() => {
              handleNext();
          }, 1500);
      }
  };

  const handleRevealAll = () => {
      const newProgress = [...progress];
      newProgress[currentIndex].words = newProgress[currentIndex].words.map(w => ({ ...w, status: 'revealed' }));
      setProgress(newProgress);
  };

  const handleNext = () => {
      if (currentIndex < sessionAyahs.length - 1) {
          setCurrentIndex(prev => prev + 1);
      } else {
          setSessionState('summary');
      }
  };

  const handlePrev = () => {
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
      }
  };

  const resetCurrent = () => {
      const newProgress = [...progress];
      newProgress[currentIndex].words = newProgress[currentIndex].words.map(w => ({ ...w, status: 'hidden' }));
      newProgress[currentIndex].isCompleted = false;
      setProgress(newProgress);
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
             <button onClick={() => setSessionState('summary')} className="p-2 text-slate-400 hover:text-red-500">
                 <XCircle size={20} />
             </button>
         )}
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto relative pb-56" ref={scrollContainerRef}>
        
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
                    const isActive = index === currentIndex;
                    const ayahProgress = progress[index];
                    const isCompleted = ayahProgress?.isCompleted;
                    
                    return (
                        <div 
                            key={ayah.number}
                            ref={isActive ? activeAyahRef : null}
                            className={`relative p-6 rounded-[2rem] transition-all duration-500 border-2 ${
                                isActive ? 'bg-white border-teal-500 shadow-2xl shadow-teal-500/10 scale-100 z-10' 
                                : isCompleted ? 'bg-teal-50/50 border-transparent opacity-60'
                                : 'bg-transparent border-transparent opacity-40'
                            }`}
                        >
                             {/* Status Badge */}
                             <div className="absolute top-4 left-4">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                                    isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {ayah.numberInSurah}
                                </span>
                             </div>

                             {/* Word-by-Word Rendering */}
                             <div className="flex flex-wrap flex-row-reverse gap-x-2 gap-y-4 justify-center py-4 px-2" dir="rtl">
                                {ayahProgress?.words.map((w, wIdx) => {
                                    // Status Logic
                                    const isRevealed = w.status === 'revealed';
                                    const isCorrect = w.status === 'correct';
                                    const isWrong = w.status === 'wrong';
                                    const isHidden = w.status === 'hidden';

                                    let styleClass = "text-slate-800"; // Default
                                    if (isHidden) styleClass = "text-transparent bg-slate-200/50 rounded-lg blur-[2px] select-none";
                                    if (isRevealed) styleClass = "text-slate-800 animate-in fade-in";
                                    if (isCorrect) styleClass = "text-teal-700 font-bold";
                                    if (isWrong) styleClass = "text-red-500 decoration-red-400 underline underline-offset-8 decoration-wavy";

                                    return (
                                        <span 
                                            key={wIdx}
                                            className={`font-quran text-3xl md:text-4xl transition-all duration-300 px-1 ${styleClass}`}
                                        >
                                            {w.text}
                                        </span>
                                    );
                                })}
                             </div>
                        </div>
                    );
                })}
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
                    You have completed the revision session for {selectedSurah?.englishName}.
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

      {/* BOTTOM ACTION BAR (Sticky above nav) */}
      {sessionState === 'active' && (
        <div className="fixed bottom-[85px] md:bottom-10 left-0 right-0 z-[60] flex flex-col items-center pointer-events-none">
            
            {/* Live Transcript Bubble */}
            {isRecording && liveTranscript && (
                <div className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl mb-4 text-sm font-quran max-w-[80%] text-center animate-in fade-in slide-in-from-bottom-2">
                    {liveTranscript}
                </div>
            )}

            {/* Controls Container */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 rounded-full px-6 py-3 flex items-center gap-6 pointer-events-auto">
                <button 
                   onClick={handlePrev}
                   disabled={currentIndex === 0}
                   className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>

                {isRecording ? (
                    <button 
                        onClick={stopRecording}
                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/30 animate-pulse scale-105"
                    >
                        <Square size={24} fill="currentColor" />
                    </button>
                ) : isAnalyzing ? (
                    <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-500 border-t-transparent rounded-full flex items-center justify-center animate-spin">
                        <Wand2 className="text-indigo-600" size={24} />
                    </div>
                ) : (
                    <button 
                        onClick={startRecording}
                        className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Mic size={28} className="group-hover:text-teal-400 transition-colors" />
                    </button>
                )}

                <div className="flex gap-2">
                    <button 
                        onClick={handleRevealAll}
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors"
                        title="Reveal Ayah"
                    >
                        <Eye size={20} />
                    </button>
                    <button 
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                    title="Next Ayah"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default MemorizationScreen;
