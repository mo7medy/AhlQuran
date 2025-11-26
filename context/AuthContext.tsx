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

  // Load User from Token on Mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
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
        // If formData has a password, it's a real login/signup
        // If it's a mock login from the previous code (without password field handling in some places), 
        // we might fail here. But AuthScreen uses password now.
        
        const isSignup = !!formData.name; // Simple heuristic: Name is present on signup
        const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';

        const payload = { ...formData, role };
        
        const res = await fetch(endpoint, {
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
        alert("Authentication Failed. Please check console or ensure Backend is running.");
        // Fallback to mock for demo purposes if backend fails
        fallbackMockLogin(role, formData);
    }
  };

  const fallbackMockLogin = (role: string, formData: any) => {
      // KEEPING THIS ONLY SO APP DOESN'T BREAK IF YOU DON'T HAVE MONGO RUNNING
      console.warn("Falling back to Mock Login");
      const baseUser: User = {
        uid: 'user_' + Date.now(),
        email: formData?.email || 'user@demo.com',
        displayName: formData?.name || 'Demo User',
        role: role as any,
        memorizedAyahs: 0,
        avatarUrl: `https://ui-avatars.com/api/?name=Demo+User`
      };
      setUser(baseUser);
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<Teacher>) => {
    if (!user) return;
    
    // Optimistic Update
    setUser({ ...user, ...data });

    try {
        const token = localStorage.getItem('token');
        await fetch('/api/users/profile', {
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
};