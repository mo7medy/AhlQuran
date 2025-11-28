import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Teacher } from '../types';

interface AuthContextType {
  user: User | Teacher | null;
  loading: boolean;
  login: (role: 'student' | 'teacher', formData?: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Teacher>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to determine API URL
  // Safely checks import.meta.env and process.env to prevent crashes
  const getApiUrl = (endpoint: string) => {
    const metaEnv = (import.meta as any).env || {};
    const processEnv = (typeof process !== 'undefined' ? process.env : {}) as any;
    
    // Priority: VITE_API_URL (Amplify/Vercel) -> Empty String (Relative Path for Proxy)
    const baseUrl = metaEnv.VITE_API_URL || processEnv.VITE_API_URL || '';
    return `${baseUrl}${endpoint}`;
  };

  // Load User from Token on Mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(getApiUrl('/api/auth/me'), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const userData = await res.json();
            setUser(userData);
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
      } catch (err) {
        console.error("Auth Load Error:", err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (role: 'student' | 'teacher', formData?: any) => {
    try {
        const isSignup = !!formData.name;
        const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
        const url = getApiUrl(endpoint);

        const payload = { ...formData, role };
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'Authentication failed');
        }

        localStorage.setItem('token', data.token);
        setUser(data.user);
    } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Authentication Failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<Teacher>) => {
    if (!user) return;
    setUser({ ...user, ...data });

    try {
        const token = localStorage.getItem('token');
        await fetch(getApiUrl('/api/users/profile'), {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    } catch (err) {
        console.error("Profile update failed", err);
    }
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
}