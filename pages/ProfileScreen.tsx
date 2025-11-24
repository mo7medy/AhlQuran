import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Bell, Globe, Moon } from 'lucide-react';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-gray-600" }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <Icon size={20} className={color} />
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-y-auto pb-24">
      <div className="bg-white p-6 flex flex-col items-center border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-emerald-50 relative">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-3xl font-bold">
              {user?.displayName?.[0]}
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user?.displayName}</h2>
        <p className="text-sm text-gray-500 capitalize">{user?.role} Account</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <span className="block text-2xl font-bold text-emerald-600">{user?.memorizedAyahs}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Ayahs Memorized</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <span className="block text-2xl font-bold text-amber-500">12</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Courses Active</span>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <h3 className="px-4 py-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">App Settings</h3>
            <MenuItem icon={Bell} label="Notifications" />
            <MenuItem icon={Globe} label="Language (English)" />
            <MenuItem icon={Moon} label="Dark Mode" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <MenuItem icon={Settings} label="Account Settings" />
            <MenuItem icon={LogOut} label="Log Out" color="text-red-500" onClick={logout} />
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;