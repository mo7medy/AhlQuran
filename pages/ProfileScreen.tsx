import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Bell, Globe, Moon, ChevronRight, User as UserIcon } from 'lucide-react';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-slate-600", badge, value }: any) => (
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

  return (
    <div className="flex-1 bg-[#FDFCF8] flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-6 border-b border-slate-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-32 bg-slate-900"></div>
        
        <div className="relative z-10 w-28 h-28 rounded-full bg-white p-1 mb-4 shadow-xl">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-teal-100 rounded-full text-teal-600 text-3xl font-bold">
              {user?.displayName?.[0]}
            </div>
          )}
          <button className="absolute bottom-1 right-1 bg-slate-900 text-white p-2 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform">
             <Settings size={14} />
          </button>
        </div>
        
        <div className="text-center z-10">
            <h2 className="text-2xl font-extrabold text-slate-900">{user?.displayName}</h2>
            <p className="text-sm text-slate-500 font-medium capitalize mt-1 bg-slate-100 px-3 py-1 rounded-full inline-block">{user?.role} Account</p>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center hover:border-teal-100 transition-colors">
            <span className="block text-3xl font-extrabold text-teal-600 mb-1">{user?.memorizedAyahs}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('profile.ayahs_memorized')}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center hover:border-amber-100 transition-colors">
            <span className="block text-3xl font-extrabold text-amber-500 mb-1">12</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('profile.courses_active')}</span>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 overflow-hidden border border-slate-100">
            <h3 className="px-5 py-4 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">{t('profile.app_settings')}</h3>
            
            <MenuItem 
                icon={Bell} 
                label={t('profile.notifications')} 
                onClick={() => navigate('/notifications')} 
                badge={unreadCount}
                color="text-amber-500"
            />
            
            <MenuItem 
                icon={Globe} 
                label={t('profile.language')} 
                value={language === 'en' ? 'English' : 'العربية'} 
                onClick={toggleLanguage}
                color="text-indigo-500"
            />
            
            <MenuItem 
                icon={Moon} 
                label={t('profile.dark_mode')} 
                value="Off"
                onClick={() => {}}
                color="text-slate-500"
            />
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 overflow-hidden border border-slate-100">
            <h3 className="px-5 py-4 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">{t('profile.account_settings')}</h3>
            <MenuItem icon={UserIcon} label={t('profile.edit_profile')} onClick={() => {}} />
            <MenuItem icon={LogOut} label={t('nav.signout')} color="text-red-500" onClick={logout} />
        </div>
        
        <div className="text-center pb-4">
            <p className="text-xs font-bold text-slate-300">Version 1.0.2</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;