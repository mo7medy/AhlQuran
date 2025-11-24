import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, Users, User, LogOut, Moon, Settings, Bell, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // If user is not logged in, just render children without sidebar (e.g., Landing Page)
  if (!user) {
      return (
          <div className="flex h-[100dvh] w-full bg-[#FDFCF8] overflow-hidden text-slate-900">
             <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-[#FDFCF8]">
                {children}
             </main>
          </div>
      );
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        isActive(path) 
          ? 'bg-white text-teal-950 shadow-lg shadow-teal-900/10 font-bold' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
      }`}
    >
      <Icon size={20} className={`transition-colors duration-300 ${isActive(path) ? 'text-teal-600' : 'text-slate-500 group-hover:text-white'}`} strokeWidth={isActive(path) ? 2.5 : 2} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-[#FDFCF8] overflow-hidden text-slate-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] bg-slate-950 text-white h-full shrink-0 relative z-20">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center gap-3">
           <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
             <Sparkles size={22} className="text-white fill-white" />
           </div>
           <div>
             <h1 className="font-bold text-xl tracking-tight">QuranMemo</h1>
           </div>
        </div>

        {/* User Mini Profile */}
        <div className="mx-6 mb-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="relative">
                <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.displayName}&background=0D9488&color=fff`} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-slate-900 rounded-full"></div>
            </div>
           <div className="overflow-hidden">
             <h3 className="font-bold text-sm truncate text-slate-200">{user?.displayName?.split(' ')[0]}</h3>
             <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user?.role}</p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-2">Menu</p>
          <NavItem path="/dashboard" icon={Home} label="Dashboard" />
          <NavItem path="/mushaf" icon={BookOpen} label="Read Quran" />
          <NavItem path="/memorize" icon={GraduationCap} label="Memorization" />
          
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-6">Community</p>
          <NavItem path="/teachers" icon={Users} label="Find Teachers" />
          <NavItem path="/courses" icon={BookOpen} label="Courses" />
          
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-6">Account</p>
          <NavItem path="/profile" icon={User} label="My Profile" />
        </nav>

        {/* Footer actions */}
        <div className="p-6 pt-2">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all text-sm font-medium"
          >
             <LogOut size={18} />
             <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-[#FDFCF8] md:bg-white md:rounded-l-[40px] md:shadow-2xl md:my-0 md:mr-0 z-10">
         <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
            {children}
         </div>
      </main>
    </div>
  );
};

export default ResponsiveLayout;