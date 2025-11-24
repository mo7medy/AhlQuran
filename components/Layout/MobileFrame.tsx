import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, Users, User, LogOut, Moon, Settings, Bell, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Renamed internally to ResponsiveLayout to reflect new purpose
const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive(path) 
          ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20' 
          : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
      }`}
    >
      <Icon size={20} className={isActive(path) ? 'text-amber-400' : 'text-emerald-300 group-hover:text-emerald-200'} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden md:flex flex-col w-72 bg-emerald-900 text-white h-full shrink-0 shadow-xl relative z-20">
        {/* Header */}
        <div className="p-6 border-b border-emerald-800/50 flex items-center gap-3">
           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
             <Moon size={24} className="text-amber-400 fill-amber-400" />
           </div>
           <div>
             <h1 className="font-serif text-xl font-bold tracking-wide">QuranMemo</h1>
             <p className="text-xs text-emerald-300 opacity-80">Hifz & Learning</p>
           </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-6 bg-emerald-800/30 rounded-2xl border border-emerald-700/50 flex items-center gap-3">
           <img 
             src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.displayName}&background=0D9488&color=fff`} 
             alt="User" 
             className="w-10 h-10 rounded-full border-2 border-emerald-500"
           />
           <div className="overflow-hidden">
             <h3 className="font-bold text-sm truncate">{user?.displayName}</h3>
             <p className="text-xs text-emerald-300 capitalize">{user?.role}</p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem path="/" icon={Home} label="Dashboard" />
          <NavItem path="/mushaf" icon={BookOpen} label="Read Quran" />
          <NavItem path="/memorize" icon={GraduationCap} label="Memorization" />
          <NavItem path="/teachers" icon={Users} label="Find Teachers" />
          <NavItem path="/courses" icon={BookOpen} label="Courses" />
          <NavItem path="/profile" icon={User} label="My Profile" />
          
          <div className="pt-6 mt-6 border-t border-emerald-800/50">
             <p className="px-4 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Settings</p>
             <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-emerald-200 hover:text-white transition-colors">
                <Bell size={16} /> Notifications
             </button>
             <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-emerald-200 hover:text-white transition-colors">
                <Globe size={16} /> Language
             </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-800/50">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-all"
          >
             <LogOut size={20} />
             <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-[#f3f4f6]">
         <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
            {children}
         </div>
      </main>
    </div>
  );
};

export default ResponsiveLayout;