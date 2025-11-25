
import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahList, fetchSurahDetails } from '../services/quranApi';
import { Surah, Ayah } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Eye, EyeOff, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, 
  Settings, CheckCircle, AlertTriangle, XCircle, BarChart3, BookOpen, 
  Volume2, ArrowRight, Award, Repeat, Mic, Square, Loader2, Wand2
} from 'lucide-react';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type SessionState = 'setup' | 'active' | 'summary';

interface SessionStats {
  perfect: number;
  good: number;
  forgot: number;
}

interface AIFeedback {
    score: number;
    isCorrect: boolean;
    feedback: string;
    highlightedHtml: string; // Arabic text with red spans for errors
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTextHidden, setIsTextHidden] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ perfect: 0, good: 0, forgot: 0 });
  
  // AI Listening State
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const data = await fetchSurahList();
        setSurahs(data);
        if (data.length > 0) {
            setSelectedSurah(data[0]); // Default Al-Fatiha
        }
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
            setRangeEnd(data.length);
            setLoading(false);
        };
        loadAyahs();
    }
  }, [selectedSurah]);

  // Audio Handler Cleanup
  useEffect(() => {
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        stopRecording(); // Cleanup recorder if active
    };
  }, []);

  const handleStartSession = () => {
    const filtered = ayahs.filter(a => a.numberInSurah >= rangeStart && a.numberInSurah <= rangeEnd);
    setSessionAyahs(filtered);
    setCurrentIndex(0);
    setStats({ perfect: 0, good: 0, forgot: 0 });
    setIsTextHidden(true);
    setSessionState('active');
    setAiFeedback(null);
  };

  const handleGrade = (grade: 'perfect' | 'good' | 'forgot') => {
    setStats(prev => ({ ...prev, [grade]: prev[grade] + 1 }));
    setAiFeedback(null); // Reset feedback for next card
    
    if (currentIndex < sessionAyahs.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsTextHidden(true); // Auto hide next card
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    } else {
        setSessionState('summary');
    }
  };

  const toggleAudio = () => {
    if (!sessionAyahs[currentIndex]?.audio) return;

    if (isPlaying) {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
    } else {
        // Cleanup old audio if exists
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(sessionAyahs[currentIndex].audio);
        audioRef.current = audio;
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);

        // Safe play
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Playback error:", error);
                }
                setIsPlaying(false);
            });
        }
    }
  };

  const restartSession = () => {
      setCurrentIndex(0);
      setStats({ perfect: 0, good: 0, forgot: 0 });
      setIsTextHidden(true);
      setSessionState('active');
      setAiFeedback(null);
  };

  // --- AI Listening Logic ---

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            analyzeRecitation(audioBlob);
            
            // Stop all tracks to release mic
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setAiFeedback(null);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access is required to check your recitation.");
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
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix (e.g. "data:audio/webm;base64,")
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const analyzeRecitation = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
        const base64Audio = await blobToBase64(audioBlob);
        const currentAyah = sessionAyahs[currentIndex];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: "audio/webm",
                                data: base64Audio
                            }
                        },
                        {
                            text: `The user is reciting Surah ${selectedSurah?.englishName}, Ayah ${currentAyah.numberInSurah}. 
                            The correct Arabic text is: "${currentAyah.text}".
                            
                            Task:
                            1. Listen carefully to the recitation.
                            2. Compare it to the correct Arabic text.
                            3. Identify if there are missing words, wrong words, or major pronunciation errors.
                            4. Return a JSON object with:
                               - score: (0-100) based on accuracy.
                               - isCorrect: boolean (true if minor or no mistakes).
                               - feedback: A short, encouraging advice in English.
                               - highlightedHtml: Return the EXACT original Arabic text provided above, but wrap any word that was missed or recited incorrectly in <span style='color:#ef4444; text-decoration: underline;'>WORD</span>. If the recitation was totally wrong or silent, just return the text in red.`
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        isCorrect: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING },
                        highlightedHtml: { type: Type.STRING }
                    },
                    required: ["score", "isCorrect", "feedback", "highlightedHtml"]
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text) as AIFeedback;
            setAiFeedback(result);
            setIsTextHidden(false); // Reveal text to show mistakes
        }

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        setAiFeedback({
            score: 0,
            isCorrect: false,
            feedback: "Could not analyze audio. Please try again.",
            highlightedHtml: sessionAyahs[currentIndex].text
        });
    } finally {
        setIsAnalyzing(false);
    }
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
    <div className="flex-1 bg-[#FDFCF8] flex flex-col h-full overflow-hidden relative">
      
      {/* HEADER */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between z-20">
         <div className="flex items-center gap-3">
             {sessionState !== 'setup' && (
                 <button onClick={() => setSessionState('setup')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500">
                     <ChevronLeft size={24} />
                 </button>
             )}
             <h1 className="text-xl font-bold text-slate-900">
                 {sessionState === 'setup' ? 'Memorization Setup' : selectedSurah?.englishName}
             </h1>
         </div>
         {sessionState === 'active' && (
             <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                 {currentIndex + 1} / {sessionAyahs.length}
             </div>
         )}
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto relative pb-28 md:pb-0">
        
        {/* VIEW 1: SETUP */}
        {sessionState === 'setup' && (
            <div className="p-6 max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Surah Selector */}
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
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm appearance-none"
                    >
                        {surahs.map(s => (
                            <option key={s.number} value={s.number}>
                                {s.number}. {s.englishName} ({s.name})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Range Selector */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-teal-600" /> Target Range
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 mb-2 block">From Ayah</label>
                            <input 
                                type="number" 
                                min={1} 
                                max={ayahs.length}
                                value={rangeStart}
                                onChange={(e) => setRangeStart(Math.min(Number(e.target.value), rangeEnd))}
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-center font-bold text-xl text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div className="text-slate-300 font-bold text-xl">-</div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 mb-2 block">To Ayah</label>
                            <input 
                                type="number" 
                                min={rangeStart} 
                                max={ayahs.length}
                                value={rangeEnd}
                                onChange={(e) => setRangeEnd(Math.max(Number(e.target.value), rangeStart))}
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-center font-bold text-xl text-slate-800 focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    <div className="bg-teal-50 rounded-2xl p-4 flex items-center gap-4 text-teal-800">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-teal-600 font-bold shrink-0">
                            {rangeEnd - rangeStart + 1}
                        </div>
                        <div className="text-sm font-medium">
                            Ayahs selected for this session.
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleStartSession}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    Start Memorization <ArrowRight size={20} />
                </button>
            </div>
        )}

        {/* VIEW 2: ACTIVE SESSION */}
        {sessionState === 'active' && sessionAyahs.length > 0 && (
            <div className="flex flex-col h-full p-6 max-w-2xl mx-auto">
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
                    <div 
                        className="bg-teal-500 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${((currentIndex) / sessionAyahs.length) * 100}%` }}
                    ></div>
                </div>

                {/* Card */}
                <div className="flex-1 flex flex-col justify-center min-h-[300px]">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50 p-8 md:p-12 relative overflow-hidden group">
                        
                        {/* Audio Play Button */}
                        <button 
                            onClick={toggleAudio}
                            disabled={isRecording}
                            className={`absolute top-6 left-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50'}`}
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Volume2 size={20} />}
                        </button>

                        {/* Text Visibility Toggle */}
                        <button 
                            onClick={() => setIsTextHidden(!isTextHidden)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                            {isTextHidden ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>

                        {/* Arabic Text (With AI Feedback Highlight support) */}
                        <div 
                            className={`text-center transition-all duration-500 my-10 ${isTextHidden ? 'blur-md opacity-20 select-none' : 'opacity-100 blur-0'}`}
                            onClick={() => isTextHidden && setIsTextHidden(false)}
                        >
                            {aiFeedback ? (
                                <p 
                                    className="font-quran text-4xl md:text-5xl leading-[2.5] text-slate-800" 
                                    dir="rtl"
                                    dangerouslySetInnerHTML={{ __html: aiFeedback.highlightedHtml }}
                                ></p>
                            ) : (
                                <p className="font-quran text-4xl md:text-5xl leading-[2.5] text-slate-800" dir="rtl">
                                    {sessionAyahs[currentIndex].text}
                                </p>
                            )}
                        </div>

                        {/* AI Feedback Box */}
                        {aiFeedback && !isTextHidden && (
                             <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${aiFeedback.isCorrect ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                 <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${aiFeedback.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                     {aiFeedback.isCorrect ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                 </div>
                                 <div>
                                     <p className="font-bold text-sm mb-1">{aiFeedback.score}% Accuracy</p>
                                     <p className="text-xs opacity-90">{aiFeedback.feedback}</p>
                                 </div>
                             </div>
                        )}

                        {/* Recording State Overlay */}
                        {isRecording && (
                             <div className="absolute inset-x-0 bottom-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex gap-1 items-end h-8 mb-2">
                                     <div className="w-1.5 bg-red-500 rounded-full animate-[bounce_1s_infinite] h-4"></div>
                                     <div className="w-1.5 bg-red-500 rounded-full animate-[bounce_1.2s_infinite] h-8"></div>
                                     <div className="w-1.5 bg-red-500 rounded-full animate-[bounce_0.8s_infinite] h-5"></div>
                                     <div className="w-1.5 bg-red-500 rounded-full animate-[bounce_1.1s_infinite] h-7"></div>
                                </div>
                                <span className="text-red-500 font-bold text-xs uppercase tracking-widest animate-pulse">Listening...</span>
                             </div>
                        )}

                        {/* Analyzing Overlay */}
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <Wand2 className="text-indigo-600 mb-4 animate-bounce" size={40} />
                                <h3 className="font-bold text-slate-900 text-lg">AI Checking...</h3>
                                <p className="text-slate-500 text-sm">Comparing your recitation</p>
                            </div>
                        )}

                        {/* Hint Text when hidden */}
                        {isTextHidden && !isRecording && (
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="bg-slate-900/5 backdrop-blur-sm text-slate-500 px-4 py-2 rounded-full text-sm font-bold border border-white/20">
                                    Tap to reveal
                                </span>
                             </div>
                        )}
                        
                        <div className="text-center mt-6">
                            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                                Ayah {sessionAyahs[currentIndex].numberInSurah}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 space-y-4">
                    {/* Recording Button */}
                    <div className="flex justify-center">
                        {isRecording ? (
                            <button 
                                onClick={stopRecording}
                                className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all scale-105 active:scale-95"
                            >
                                <Square size={20} fill="currentColor" /> Stop
                            </button>
                        ) : (
                            <button 
                                onClick={startRecording}
                                disabled={isAnalyzing}
                                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Mic size={20} className="group-hover:text-teal-400 transition-colors" /> Check Recitation
                            </button>
                        )}
                    </div>

                    {/* Grading Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                        <button 
                            onClick={() => handleGrade('forgot')}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors active:scale-95"
                        >
                            <XCircle size={24} />
                            <span className="text-xs font-bold uppercase tracking-wide">Forgot</span>
                        </button>

                        <button 
                            onClick={() => handleGrade('good')}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-colors active:scale-95"
                        >
                            <AlertTriangle size={24} />
                            <span className="text-xs font-bold uppercase tracking-wide">Hard</span>
                        </button>

                        <button 
                            onClick={() => handleGrade('perfect')}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100 transition-colors active:scale-95"
                        >
                            <CheckCircle size={24} />
                            <span className="text-xs font-bold uppercase tracking-wide">Perfect</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW 3: SUMMARY */}
        {sessionState === 'summary' && (
            <div className="flex flex-col items-center justify-center h-full p-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-teal-500/20">
                    <Award size={40} />
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Session Complete!</h2>
                <p className="text-slate-500 mb-10 text-center max-w-xs">
                    You reviewed <span className="font-bold text-slate-800">{sessionAyahs.length} Ayahs</span> from {selectedSurah?.englishName}.
                </p>

                <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-10">
                    <div className="bg-teal-50 p-4 rounded-2xl text-center border border-teal-100">
                        <span className="block text-2xl font-bold text-teal-700">{stats.perfect}</span>
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Perfect</span>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl text-center border border-amber-100">
                        <span className="block text-2xl font-bold text-amber-600">{stats.good}</span>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Good</span>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                        <span className="block text-2xl font-bold text-red-600">{stats.forgot}</span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Missed</span>
                    </div>
                </div>

                <div className="flex flex-col w-full max-w-xs gap-3">
                    <button 
                        onClick={restartSession}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} /> Restart Session
                    </button>
                    <button 
                        onClick={() => setSessionState('setup')}
                        className="w-full bg-white text-slate-600 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <Settings size={18} /> New Configuration
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default MemorizationScreen;
