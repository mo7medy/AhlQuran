import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TEACHERS } from '../services/mockData';
import { Teacher, ChatMessage } from '../types';
import { ChevronLeft, Star, MessageCircle, Calendar, CreditCard, Clock, CheckCircle, Send, X, Shield, Lock } from 'lucide-react';

const TeacherProfileScreen = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'reviews'>('schedule');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState<number>(0); // Index of day
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
      // Initialize mock chat
      setMessages([
        { id: '1', senderId: found.uid, text: `Assalamu Alaikum! How can I help you with your Quran studies?`, timestamp: new Date(Date.now() - 100000), isMe: false },
      ]);
    }
  }, [teacherId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  if (!teacher) return <div className="p-10 text-center">Loading...</div>;

  // Mock Days for Calendar
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      full: d
    };
  });

  // Mock Time Slots
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

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

    // Mock Reply
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
        setSelectedSlot(null); // Reset
        // Navigate or show success toast here
      }, 2000);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col h-full relative">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg">Teacher Profile</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 relative">
        {/* Profile Card */}
        <div className="bg-white p-6 pb-8">
           <div className="flex gap-5 items-start">
             <img src={teacher.avatarUrl} className="w-20 h-20 rounded-2xl bg-gray-200 object-cover border-2 border-white shadow-lg" alt={teacher.displayName} />
             <div className="flex-1 pt-1">
               <h1 className="text-xl font-bold text-gray-900">{teacher.displayName}</h1>
               <div className="flex items-center gap-1 text-amber-500 font-bold text-sm my-1">
                 <Star size={14} fill="currentColor" /> {teacher.rating} <span className="text-gray-400 font-normal">({teacher.reviewsCount} reviews)</span>
               </div>
               <p className="text-emerald-700 font-medium">${teacher.hourlyRate}/hour</p>
             </div>
           </div>
           
           <p className="mt-4 text-gray-600 text-sm leading-relaxed">{teacher.bio}</p>
           
           <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle size={18} /> Chat
              </button>
           </div>
        </div>

        {/* Tabs */}
        <div className="mt-2 bg-white min-h-[500px] rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-6">
          <div className="flex border-b border-gray-100 mb-6">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 pb-4 font-medium text-sm transition-colors relative ${activeTab === 'schedule' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              Schedule
              {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 pb-4 font-medium text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              Reviews
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>}
            </button>
          </div>

          {activeTab === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Calendar size={18} className="text-emerald-500" /> Select Date
               </h3>
               
               {/* Date Scroll */}
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-6">
                 {days.map((d, idx) => (
                   <button 
                     key={idx}
                     onClick={() => { setSelectedDate(idx); setSelectedSlot(null); }}
                     className={`flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl border transition-all ${
                       selectedDate === idx 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300'
                     }`}
                   >
                     <span className="text-xs font-medium uppercase">{d.day}</span>
                     <span className="text-xl font-bold mt-1">{d.date}</span>
                   </button>
                 ))}
               </div>

               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-emerald-500" /> Available Times
               </h3>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                 {timeSlots.map(slot => (
                   <button
                     key={slot}
                     onClick={() => setSelectedSlot(slot)}
                     className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                        selectedSlot === slot
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'
                     }`}
                   >
                     {slot}
                   </button>
                 ))}
               </div>

               <button 
                 disabled={!selectedSlot}
                 onClick={() => setShowPayment(true)}
                 className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                    selectedSlot ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-gray-300 cursor-not-allowed'
                 }`}
               >
                 Book Session ({selectedSlot || '--:--'})
               </button>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center text-gray-400 py-10">
              <Star size={48} className="mx-auto mb-2 opacity-20" />
              <p>Reviews coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* CHAT MODAL / DRAWER */}
      {isChatOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
           {/* Chat Header */}
           <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                 <ChevronLeft size={24} className="text-gray-600" />
               </button>
               <div className="flex items-center gap-2">
                 <div className="relative">
                   <img src={teacher.avatarUrl} className="w-10 h-10 rounded-full" alt="avatar" />
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                 </div>
                 <div>
                   <h3 className="font-bold text-sm text-gray-900">{teacher.displayName}</h3>
                   <p className="text-xs text-green-600">Online</p>
                 </div>
               </div>
             </div>
           </div>

           {/* Messages Area */}
           <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.isMe 
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-100' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
             <input 
               type="text" 
               value={inputMessage}
               onChange={e => setInputMessage(e.target.value)}
               placeholder="Type a message..."
               className="flex-1 bg-gray-100 border-0 rounded-full px-5 focus:ring-2 focus:ring-emerald-500 outline-none"
             />
             <button type="submit" disabled={!inputMessage.trim()} className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md">
               <Send size={20} />
             </button>
           </form>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
           <div className="bg-white w-full md:w-[480px] md:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
             
             {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-bounce">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-500">Your session has been scheduled successfully.</p>
                </div>
             ) : (
               <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="text-emerald-600" /> Checkout
                  </h2>
                  <button onClick={() => setShowPayment(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Total to pay</p>
                    <p className="text-2xl font-bold text-gray-900">${teacher.hourlyRate}.00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded">1 Hour Session</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-bold text-gray-700">Payment Method</p>
                  
                  <label className="flex items-center gap-4 p-4 border border-emerald-500 bg-emerald-50/50 rounded-xl cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-[5px] border-emerald-600 bg-white"></div>
                    <div className="flex-1 flex items-center gap-2">
                      <CreditCard size={20} className="text-gray-600" />
                      <span className="font-medium text-gray-800">Credit Card</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <div className="w-5 h-5 rounded-full border border-gray-300 bg-white"></div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-bold italic text-blue-800 text-lg leading-none">PayPal</span>
                    </div>
                  </label>
                </div>

                {/* Simulated Card Form */}
                <div className="space-y-3 mb-6">
                   <div className="relative">
                     <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Card Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 transition-colors" />
                   </div>
                   <div className="flex gap-3">
                     <input type="text" placeholder="MM/YY" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors" />
                     <input type="text" placeholder="CVC" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors" />
                   </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                  <Shield size={12} /> Secure 256-bit SSL Encrypted payment
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={paymentProcessing}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>Pay ${teacher.hourlyRate}.00</>
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