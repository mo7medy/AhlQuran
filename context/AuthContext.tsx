import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: 'student' | 'teacher') => void;
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

  const login = (role: 'student' | 'teacher') => {
    const mockUser: User = {
      uid: 'user_12345',
      email: role === 'student' ? 'student@demo.com' : 'teacher@demo.com',
      displayName: role === 'student' ? 'Abdullah Student' : 'Sheikh Abdullah',
      role: role,
      memorizedAyahs: 145,
      avatarUrl: `https://picsum.photos/100/100?random=${role === 'student' ? 8 : 9}`
    };
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