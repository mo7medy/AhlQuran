import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Teacher } from '../types';

interface AuthContextType {
  user: User | Teacher | null;
  loading: boolean;
  login: (role: 'student' | 'teacher', formData?: any) => void;
  logout: () => void;
  updateProfile: (data: Partial<Teacher>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Teacher | null>(null);
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
    const baseUser: User = {
      uid: 'user_' + Date.now(),
      email: formData?.email || (role === 'student' ? 'student@demo.com' : 'teacher@demo.com'),
      displayName: formData?.name || (role === 'student' ? 'Abdullah Student' : 'Sheikh Abdullah'),
      role: role,
      memorizedAyahs: role === 'student' ? 0 : 6236, // New students start at 0
      avatarUrl: `https://ui-avatars.com/api/?name=${formData?.name || (role==='student' ? 'Abdullah' : 'Sheikh')}&background=${role === 'student' ? '0D9488' : '0F172A'}&color=fff`
    };

    let finalUser: User | Teacher = baseUser;

    if (role === 'teacher') {
       const teacherData: Teacher = {
           ...baseUser,
           bio: formData?.bio || "Certified Quran teacher.",
           subjects: formData?.subjects || ["Tajweed"],
           hourlyRate: formData?.hourlyRate || 20,
           rating: 5.0,
           reviewsCount: 0
       };
       finalUser = teacherData;
    }
    
    setUser(finalUser);
    localStorage.setItem('quran_app_user', JSON.stringify(finalUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quran_app_user');
  };

  const updateProfile = (data: Partial<Teacher>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('quran_app_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
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