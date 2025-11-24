import React from 'react';
import { Home, BookOpen, GraduationCap, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${
        isActive(path) ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-400'
      }`}
    >
      <Icon size={24} strokeWidth={isActive(path) ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="md:hidden bg-white border-t border-gray-100 pb-safe pt-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 shrink-0">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavItem path="/" icon={Home} label="Home" />
        <NavItem path="/mushaf" icon={BookOpen} label="Mushaf" />
        <NavItem path="/memorize" icon={GraduationCap} label="Memorize" />
        <NavItem path="/teachers" icon={Users} label="Teachers" />
        <NavItem path="/profile" icon={User} label="Profile" />
      </div>
    </div>
  );
};

export default BottomNav;