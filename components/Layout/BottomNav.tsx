import React from 'react';
import { Home, BookOpen, GraduationCap, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
      if (path === '/dashboard' && location.pathname === '/dashboard') return true;
      if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
      return false;
  };

  const NavItem = ({ path, icon: Icon }: { path: string, icon: any }) => (
    <button
      onClick={() => navigate(path)}
      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
        isActive(path) 
          ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 translate-y-[-8px]' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon size={22} strokeWidth={isActive(path) ? 2.5 : 2} />
      {isActive(path) && (
        <span className="absolute -bottom-5 text-[10px] font-bold text-teal-600 animate-in fade-in slide-in-from-bottom-2">.</span>
      )}
    </button>
  );

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="glass bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-full py-3 px-6 flex justify-between items-center max-w-sm mx-auto">
        <NavItem path="/dashboard" icon={Home} />
        <NavItem path="/mushaf" icon={BookOpen} />
        <div className="w-[1px] h-6 bg-slate-200"></div>
        <NavItem path="/memorize" icon={GraduationCap} />
        <NavItem path="/teachers" icon={Users} />
        <NavItem path="/profile" icon={User} />
      </div>
    </div>
  );
};

export default BottomNav;