import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: 'student' | 'teacher', formData?: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking local storage for session
    const storedUser = localStorage.getItem('quran_app_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (role: 'student' | 'teacher', formData?: any) => {
    // If formData is provided (from signup), use it. Otherwise use default mock data.
    const mockUser: User = {
      uid: 'user_' + Date.now(),
      email: formData?.email || (role === 'student' ? 'student@demo.com' : 'teacher@demo.com'),
      displayName: formData?.name || (role === 'student' ? 'Abdullah Student' : 'Sheikh Abdullah'),
      role: role,
      memorizedAyahs: role === 'student' ? 0 : 6236, // New students start at 0
      avatarUrl: `https://ui-avatars.com/api/?name=${formData?.name || (role==='student' ? 'Abdullah' : 'Sheikh')}&background=${role === 'student' ? '0D9488' : '0F172A'}&color=fff`
    };
    
    // In a real app, if it's a teacher, we would save the bio, subjects, rate to a backend here.
    
    setUser(mockUser);
    localStorage.setItem('quran_app_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quran_app_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};