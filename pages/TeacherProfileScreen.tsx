import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TEACHERS } from '../services/mockData';
import { Teacher, ChatMessage } from '../types';
import { ChevronLeft, Star, MessageCircle, Calendar, CreditCard, Clock, CheckCircle, Send, X, Shield, Lock, MoreHorizontal } from 'lucide-react';

const TeacherProfileScreen = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'reviews'>('schedule');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState<number>(0); 
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = MOCK_TEACHERS.find(t => t.uid === teacherId);
    if (found) {
      setTeacher(found);
      setMessages([
        { id: '1', senderId: found.uid, text: `Assalamu Alaikum! How can I help you with your Quran studies?`, timestamp: new Date(Date.now() - 100000), isMe: false },
      ]);
    }
  }, [teacherId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  if (!teacher) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      full: d
    };
  });

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM', '07:00 PM', '08:30 PM'];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputMessage,
      timestamp: new Date(),
      isMe: true
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        senderId: teacher.uid,
        text: "That sounds good. Feel free to book a trial session!",
        timestamp: new Date(),
        isMe: false
      }]);
    }, 1500);
  };

  const handlePayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayment(false);
        setPaymentSuccess(false);
        setSelectedSlot(null);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-white overflow-hidden flex flex-col h-full relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-900 border border-slate-200 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-900 border border-slate-200 transition-colors">
          <MoreHorizontal size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 relative custom-scrollbar">
        {/* Profile Info */}
        <div className="px-6 mt-4 mb-8">
           <div className="flex flex-col items-center">
             <div className="p-1 rounded-full border-2 border-dashed border-teal-500 mb-4">
                <img src={teacher.avatarUrl} className="w-28 h-28 rounded-full bg-slate-100 object-cover border-4 border-white shadow-xl" alt={teacher.displayName} />
             </div>
             
             <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">{teacher.displayName}</h1>
             <p className="text-slate-500 text-sm mb-4 text-center max-w-xs">{teacher.bio}</p>
             
             <div className="flex items-center gap-6 mb-6">
                 <div className="text-center">
                     <span className="block text-xl font-bold text-slate-900">{teacher.reviewsCount}</span>
                     <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Students</span>
                 </div>
                 <div className="w-[1px] h-8 bg-slate-100"></div>
                 <div className="text-center">
                     <div className="flex items-center gap-1 justify-center">
                         <span className="block text-xl font-bold text-slate-900">{teacher.rating}</span>
                         <Star size={14} className="fill-amber-400 text-amber-400" />
                     </div>
                     <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rating</span>
                 </div>
                 <div className="w-[1px] h-8 bg-slate-100"></div>
                 <div className="text-center">
                     <span className="block text-xl font-bold text-slate-900">${teacher.hourlyRate}</span>
                     <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Per Hour</span>
                 </div>
             </div>

             <div className="flex gap-3 w-full max-w-sm">
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <MessageCircle size={18} /> Message
                </button>
             </div>
           </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-[#FDFCF8] min-h-[500px] rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="text-teal-600" size={20} /> Available Sessions
            </h3>

            {/* Date Scroll */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-4">
                {days.map((d, idx) => (
                <button 
                    key={idx}
                    onClick={() => { setSelectedDate(idx); setSelectedSlot(null); }}
                    className={`flex flex-col items-center justify-center min-w-[4.5rem] h-[5.5rem] rounded-2xl border transition-all duration-300 ${
                    selectedDate === idx 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 scale-105' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-teal-200'
                    }`}
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{d.day}</span>
                    <span className="text-2xl font-bold">{d.date}</span>
                </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {timeSlots.map(slot => (
                <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-4 px-4 rounded-xl text-sm font-bold border transition-all duration-200 ${
                    selectedSlot === slot
                        ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-teal-200'
                    }`}
                >
                    {slot}
                </button>
                ))}
            </div>

            <button 
                disabled={!selectedSlot}
                onClick={() => setShowPayment(true)}
                className={`w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 transform active:scale-[0.98] ${
                selectedSlot ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
                {selectedSlot ? `Book Session for ${selectedSlot}` : 'Select a time'}
            </button>
        </div>
      </div>

      {/* CHAT OVERLAY */}
      {isChatOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
           <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between shadow-sm pt-safe">
             <div className="flex items-center gap-4">
               <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                 <ChevronLeft size={24} className="text-slate-900" />
               </button>
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <img src={teacher.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                   <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                 </div>
                 <div>
                   <h3 className="font-bold text-sm text-slate-900">{teacher.displayName}</h3>
                   <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Online</p>
                 </div>
               </div>
             </div>
           </div>

           <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                    msg.isMe 
                      ? 'bg-slate-900 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-2 font-medium ${msg.isMe ? 'text-slate-400' : 'text-slate-300'}`}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>

           <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3 pb-6">
             <input 
               type="text" 
               value={inputMessage}
               onChange={e => setInputMessage(e.target.value)}
               placeholder="Type a message..."
               className="flex-1 bg-slate-50 border-transparent rounded-2xl px-6 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium"
             />
             <button type="submit" disabled={!inputMessage.trim()} className="bg-teal-500 text-white p-4 rounded-2xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20">
               <Send size={20} />
             </button>
           </form>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-300">
           <div className="bg-white w-full md:w-[480px] md:rounded-[2rem] rounded-t-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
             
             {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                    <CheckCircle size={48} fill="currentColor" className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Confirmed!</h2>
                  <p className="text-slate-500 font-medium">Your session has been scheduled.</p>
                </div>
             ) : (
               <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                     Checkout
                  </h2>
                  <button onClick={() => setShowPayment(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-3xl font-extrabold text-slate-900">${teacher.hourlyRate}.00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">1 Hour Session</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="flex items-center gap-4 p-5 border-2 border-teal-500 bg-teal-50/30 rounded-2xl cursor-pointer relative overflow-hidden">
                    <div className="w-6 h-6 rounded-full border-[6px] border-teal-500 bg-white relative z-10"></div>
                    <div className="flex-1 flex items-center gap-3 relative z-10">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                          <CreditCard size={20} className="text-slate-900" />
                      </div>
                      <span className="font-bold text-slate-900 text-lg">Card</span>
                    </div>
                  </label>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={paymentProcessing}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {paymentProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>Pay Securely</>
                  )}
                </button>
               </>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfileScreen;