import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Settings, Bell, Globe, Moon, ChevronRight, User as UserIcon, 
  Camera, X, Save, Check, Mail, DollarSign, BookOpen, 
  Layout, BarChart3, Award, Shield, Zap, TrendingUp, Calendar, Trash2
} from 'lucide-react';
import { Teacher } from '../types';

const ProfileScreen = () => {
  const { user, logout, updateProfile } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    avatarUrl: '',
    bio: '',
    hourlyRate: '',
    subjects: ''
  });

  useEffect(() => {
    if (user) {
        const isTeacher = user.role === 'teacher';
        const teacher = user as Teacher;

        setFormData({
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl || '',
            bio: isTeacher ? teacher.bio : '',
            hourlyRate: isTeacher ? teacher.hourlyRate.toString() : '',
            subjects: isTeacher ? teacher.subjects.join(', ') : ''
        });
    }
  }, [user]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: any = {
        displayName: formData.displayName,
        email: formData.email,
        avatarUrl: formData.avatarUrl
    };

    if (user?.role === 'teacher') {
        updates.bio = formData.bio;
        updates.hourlyRate = parseFloat(formData.hourlyRate) || 0;
        updates.subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    updateProfile(updates);
    setIsEditing(false);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Mock Achievements Data
  const achievements = [
      { icon: Zap, label: "7 Day Streak", color: "text-amber-500", bg: "bg-amber-100" },
      { icon: BookOpen, label: "Juz 30 Complete", color: "text-teal-500", bg: "bg-teal-100" },
      { icon: Award, label: "First Session", color: "text-indigo-500", bg: "bg-indigo-100" },
  ];

  // Mock Stats Data
  const weeklyActivity = [45, 70, 30, 90, 60, 20, 85]; // Percentages
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex-1 bg-[#FDFCF8] flex flex-col overflow-y-auto pb-28 relative">
      
      {/* Success Toast */}
      {successMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              <Check size={18} className="text-teal-400" />
              <span className="font-bold text-sm">{successMsg}</span>
          </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white px-6 pt-8 pb-0 border-b border-slate-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-slate-900 to-slate-800"></div>
        
        <div className="relative z-10 w-28 h-28 rounded-full bg-white p-1 mb-3 shadow-xl group cursor-pointer" onClick={() => setIsEditing(true)}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-teal-100 rounded-full text-teal-600 text-3xl font-bold border-4 border-white">
              {user?.displayName?.[0]}
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-teal-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg z-20">
             <Shield size={12} fill="currentColor" />
          </div>
        </div>
        
        <div className="text-center z-10 mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
                {user?.displayName} 
                {/* Verified Badge */}
                <Shield size={18} className="text-teal-500 fill-teal-500/20" />
            </h2>
            <p className="text-sm text-slate-500 font-medium capitalize mt-1">{user?.role} Account • {user?.email}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex w-full max-w-md mx-auto bg-slate-50 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Statistics
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Settings
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-lg mx-auto w-full space-y-6">
        
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-teal-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                {user?.role === 'teacher' ? <UserIcon size={20} /> : <BookOpen size={20} />}
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                {user?.role === 'teacher' ? 'Students' : 'Memorized'}
                            </span>
                        </div>
                        <span className="block text-3xl font-extrabold text-slate-900">
                            {user?.role === 'teacher' ? (user as Teacher).reviewsCount : user?.memorizedAyahs}
                        </span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                {user?.role === 'teacher' ? <DollarSign size={20} /> : <Award size={20} />}
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                {user?.role === 'teacher' ? 'Rate/Hr' : 'Streak'}
                            </span>
                        </div>
                        <span className="block text-3xl font-extrabold text-slate-900">
                            {user?.role === 'teacher' ? `$${(user as Teacher).hourlyRate}` : '12 Days'}
                        </span>
                    </div>
                </div>

                {/* Bio Section */}
                {user?.role === 'teacher' && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <UserIcon size={18} className="text-indigo-500" /> About Me
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {(user as Teacher).bio || "No bio added yet."}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {(user as Teacher).subjects.map(sub => (
                                <span key={sub} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                                    {sub}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Award size={18} className="text-amber-500" /> Achievements
                        </h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">View All</span>
                     </div>
                     <div className="space-y-4">
                        {achievements.map((ach, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ach.bg} ${ach.color} group-hover:scale-110 transition-transform`}>
                                    <ach.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-sm">{ach.label}</h4>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full ${ach.color.replace('text', 'bg')} w-[80%] rounded-full`}></div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400">80%</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        )}

        {/* === STATS TAB === */}
        {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-500" /> 
                        {user?.role === 'teacher' ? 'Weekly Earnings' : 'Memorization Activity'}
                    </h3>
                    
                    <div className="flex items-end justify-between h-48 gap-2">
                        {weeklyActivity.map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden h-full flex items-end">
                                    <div 
                                        className={`w-full ${i === 3 ? 'bg-slate-900' : 'bg-teal-500'} rounded-t-xl transition-all duration-1000 group-hover:opacity-80`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                </div>
                                <span className={`text-xs font-bold ${i === 3 ? 'text-slate-900' : 'text-slate-400'}`}>{days[i]}</span>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                         <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                             <Calendar size={20} />
                         </div>
                         <h4 className="font-bold text-slate-900 text-2xl">24h</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase">Time Spent</p>
                     </div>
                     <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                         <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                             <Check size={20} />
                         </div>
                         <h4 className="font-bold text-slate-900 text-2xl">92%</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase">Accuracy</p>
                     </div>
                 </div>
            </div>
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="px-5 py-4 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Preferences</h3>
                    
                    <SettingsItem 
                        icon={Bell} 
                        label={t('profile.notifications')} 
                        onClick={() => navigate('/notifications')} 
                        badge={unreadCount}
                        color="text-amber-500"
                    />
                    
                    <SettingsItem 
                        icon={Globe} 
                        label={t('profile.language')} 
                        value={language === 'en' ? 'English' : 'العربية'} 
                        onClick={toggleLanguage}
                        color="text-indigo-500"
                    />
                    
                    <SettingsItem 
                        icon={Moon} 
                        label={t('profile.dark_mode')} 
                        value="Off"
                        onClick={() => {}}
                        color="text-slate-500"
                    />
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="px-5 py-4 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Account</h3>
                    <SettingsItem icon={UserIcon} label={t('profile.edit_profile')} onClick={() => setIsEditing(true)} />
                    <SettingsItem icon={LogOut} label={t('nav.signout')} color="text-slate-900" onClick={logout} />
                </div>

                <div className="bg-red-50 rounded-3xl border border-red-100 overflow-hidden p-6">
                    <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-red-700/70 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold w-full justify-center hover:bg-red-50 transition-colors">
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>

                <div className="text-center pt-2">
                    <p className="text-xs font-bold text-slate-300">Version 1.1.0 • Build 245</p>
                </div>
            </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-[2rem] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-10">
                  <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
                      <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                      <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 space-y-5">
                      {/* Avatar Input */}
                      <div className="flex flex-col items-center gap-4 mb-6">
                           <div className="relative">
                               <img src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.displayName}`} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" alt="Preview" />
                               <div className="absolute bottom-0 right-0 p-1.5 bg-teal-500 rounded-full border-2 border-white text-white">
                                   <Camera size={14} />
                               </div>
                           </div>
                           <div className="w-full">
                               <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 block mb-1">Avatar Image URL</label>
                               <input 
                                   type="url" 
                                   value={formData.avatarUrl}
                                   onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
                                   placeholder="https://example.com/image.jpg"
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                               />
                           </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">Display Name</label>
                          <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                  type="text" 
                                  required 
                                  value={formData.displayName}
                                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                              />
                          </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">Email Address</label>
                          <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                  type="email" 
                                  required 
                                  value={formData.email}
                                  onChange={e => setFormData({...formData, email: e.target.value})}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                              />
                          </div>
                      </div>

                      {/* Teacher Specific Fields */}
                      {user?.role === 'teacher' && (
                          <div className="space-y-5 pt-4 border-t border-slate-100">
                              <h3 className="text-sm font-bold text-slate-900">Teacher Settings</h3>
                              
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Hourly Rate ($)</label>
                                  <div className="relative">
                                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input 
                                          type="number" 
                                          value={formData.hourlyRate}
                                          onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
                                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                                      />
                                  </div>
                              </div>

                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Subjects (comma separated)</label>
                                  <div className="relative">
                                      <BookOpen className="absolute left-4 top-3 text-slate-400" size={18} />
                                      <textarea 
                                          rows={2}
                                          value={formData.subjects}
                                          onChange={e => setFormData({...formData, subjects: e.target.value})}
                                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-teal-500 outline-none font-medium resize-none"
                                      />
                                  </div>
                              </div>

                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Bio</label>
                                  <textarea 
                                      rows={3}
                                      value={formData.bio}
                                      onChange={e => setFormData({...formData, bio: e.target.value})}
                                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-teal-500 outline-none font-medium resize-none"
                                  />
                              </div>
                          </div>
                      )}

                      <button 
                          type="submit"
                          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
                      >
                          <Save size={20} /> Save Changes
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

const SettingsItem = ({ icon: Icon, label, onClick, color = "text-slate-600", badge, value }: any) => {
    const { isRTL } = useLanguage();
    return (
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all ${color}`}>
                <Icon size={20} />
            </div>
            <span className="text-slate-700 font-bold text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{value}</span>}
            {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-500/30">{badge} New</span>}
            <ChevronRight size={16} className={`text-slate-300 ${isRTL ? 'rotate-180' : ''}`} />
        </div>
        </button>
    );
};

export default ProfileScreen;