import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Check, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { AppNotification } from '../types';

const NotificationsScreen = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const getIcon = (type: AppNotification['type']) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={24} />;
      case 'reminder': return <Clock className="text-teal-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div className="flex-1 bg-[#FDFCF8] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-900 transition-colors">
                <ChevronLeft size={24} className={isRTL ? "rotate-180" : ""} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{t('notifications.title')}</h1>
         </div>
         {unreadCount > 0 && (
             <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full"
             >
                 {t('notifications.mark_all_read')}
             </button>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         {notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <Bell size={32} />
                 </div>
                 <p className="font-bold">{t('notifications.empty')}</p>
             </div>
         ) : (
             <div className="max-w-2xl mx-auto space-y-6">
                 
                 {unreadNotifications.length > 0 && (
                     <div>
                         <h3 className="px-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('notifications.new')}</h3>
                         <div className="space-y-3">
                             {unreadNotifications.map(notification => (
                                 <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    onClick={() => markAsRead(notification.id)}
                                    getIcon={getIcon}
                                 />
                             ))}
                         </div>
                     </div>
                 )}

                 {readNotifications.length > 0 && (
                     <div>
                         <h3 className="px-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('notifications.earlier')}</h3>
                         <div className="space-y-3">
                             {readNotifications.map(notification => (
                                 <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    onClick={() => {}}
                                    getIcon={getIcon}
                                 />
                             ))}
                         </div>
                     </div>
                 )}
             </div>
         )}
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onClick, getIcon }: { notification: AppNotification, onClick: () => void, getIcon: any }) => (
    <div 
        onClick={onClick}
        className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
            notification.isRead 
            ? 'bg-white border-slate-100 opacity-80 hover:opacity-100' 
            : 'bg-white border-teal-100 shadow-lg shadow-teal-500/5 hover:-translate-y-1'
        }`}
    >
        {!notification.isRead && (
            <div className="absolute top-5 right-5 w-2 h-2 bg-teal-500 rounded-full"></div>
        )}
        
        <div className="flex gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-slate-50' : 'bg-teal-50'}`}>
                {getIcon(notification.type)}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold mb-1 ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notification.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-2">{notification.message}</p>
                <p className="text-xs text-slate-400 font-bold">
                    {new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(notification.timestamp))}
                </p>
            </div>
        </div>
    </div>
);

export default NotificationsScreen;