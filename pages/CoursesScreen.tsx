import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Sparkles, User, Bot, Loader2, BookOpen, AlertCircle, HelpCircle, Feather, Scroll } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const AIScreen = () => {
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: isRTL 
        ? 'السلام عليكم! أنا مساعدك الذكي لعلوم القرآن. كيف يمكنني مساعدتك اليوم في التجويد، الفقه، أو التفسير؟'
        : 'Assalamu Alaikum! I am your AI assistant for Quranic studies. How can I help you today with Tajweed, Fiqh, or Tafsir?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // 2. Call Gemini API
      // Construct history for context (last 10 messages max to save tokens)
      const history = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...history,
            { role: 'user', parts: [{ text: text }] }
        ],
        config: {
          systemInstruction: `You are a knowledgeable, respectful, and pedagogic Islamic scholar and Quran tutor. 
          Your goal is to assist students with:
          1. **Tajweed Rules**: Explaining rules of recitation (Makharij, Sifaat, Nun Sakinah, etc.) with examples.
          2. **Tafsir**: Providing concise explanations of Quranic verses based on well-known Tafsirs (like Ibn Kathir or Jalalayn).
          3. **Fiqh**: Answering basic jurisprudence questions (Prayer, Fasting, etc.) according to mainstream Sunni schools, mentioning if there are major differences of opinion gently.
          
          Guidelines:
          - Be polite and start answers with "In the name of Allah" or similar if appropriate for the context.
          - If a question is outside these topics or requires a Fatwa for a specific personal situation, advise the user to consult a local scholar.
          - Use clear formatting (bullet points, bold text) for readability.
          - Can reply in both English and Arabic depending on the user's input language.`,
        }
      });

      const responseText = response.text || (isRTL ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." : "Sorry, I encountered an error. Please try again.");

      // 3. Add Model Response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: isRTL 
          ? "عذراً، أواجه صعوبة في الاتصال حالياً. يرجى التحقق من اتصالك بالإنترنت." 
          : "I apologize, I am having trouble connecting right now. Please check your connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: isRTL ? 'أحكام النون الساكنة' : 'Rules of Nun Sakinah', icon: Scroll },
    { label: isRTL ? 'تفسير سورة الفاتحة' : 'Tafsir of Surah Al-Fatiha', icon: BookOpen },
    { label: isRTL ? 'كيفية صلاة الوتر' : 'How to pray Witr?', icon: HelpCircle },
    { label: isRTL ? 'ما هو الإخفاء؟' : 'What is Ikhfa?', icon: Feather },
  ];

  return (
    <div className="flex-1 bg-[#FDFCF8] flex flex-col h-full overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={20} />
        </div>
        <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('nav.courses')}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Powered by Gemini 2.5</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
         {messages.map((msg) => (
             <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 
                 {/* Avatar */}
                 <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${
                     msg.role === 'user' 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-indigo-600 border-indigo-100'
                 }`}>
                     {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                 </div>

                 {/* Bubble */}
                 <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-5 shadow-sm leading-relaxed whitespace-pre-wrap ${
                     msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                 }`}>
                     {msg.text}
                 </div>
             </div>
         ))}
         
         {isLoading && (
            <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center">
                    <Bot size={18} />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-5 flex items-center gap-2 text-slate-500 text-sm font-bold">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                    Thinking...
                </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 pb-28 md:pb-4 bg-white border-t border-slate-100 relative z-20">
          
          {/* Suggestions (only show if few messages) */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
                {suggestions.map((s, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleSend(s.label)}
                        className="flex items-center gap-2 whitespace-nowrap bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold border border-indigo-100 transition-colors"
                    >
                        <s.icon size={14} />
                        {s.label}
                    </button>
                ))}
            </div>
          )}

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRTL ? "اسأل عن التجويد، الفقه..." : "Ask about Tajweed, Fiqh..."}
                className="flex-1 bg-slate-50 border-slate-200 border rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !inputText.trim()}
                className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={isRTL ? "rotate-180" : ""} />}
              </button>
          </form>
      </div>
    </div>
  );
};

export default AIScreen;