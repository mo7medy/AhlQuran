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
  const getApiUrl = (endpoint: string) => {
    const metaEnv = (import.meta as any).env || {};
    // @ts-ignore
    const processEnv = (typeof process !== 'undefined' ? process.env : {}) as any;
    
    // Priority: VITE_API_URL (Amplify/Vercel) -> Empty String (Relative Path for Proxy)
    const baseUrl = metaEnv.VITE_API_URL || processEnv.VITE_API_URL || '';
    return `${baseUrl}${endpoint}`;
  };

  // Helper to safely parse JSON response
  const handleResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      throw new Error("API_UNREACHABLE");
    }
  };

  // --- Mock/Demo Logic Helpers ---
  const saveMockUser = (userData: User | Teacher) => {
      localStorage.setItem('mock_user_data', JSON.stringify(userData));
      localStorage.setItem('token', 'mock_token_' + Date.now());
      setUser(userData);
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
        // 1. Try Real API
        const res = await fetch(getApiUrl('/api/auth/me'), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const userData = await handleResponse(res);
            setUser(userData);
        } else {
            // 2. If API fails, check for Mock Data (Fallback)
            const mockData = localStorage.getItem('mock_user_data');
            if (mockData && token.startsWith('mock_token')) {
                console.warn("Backend unreachable. Loaded data from Local Storage (Demo Mode).");
                setUser(JSON.parse(mockData));
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
      } catch (err) {
        console.warn("Backend connection failed. Switching to Offline/Demo Mode.");
        // Fallback for network errors
        const mockData = localStorage.getItem('mock_user_data');
        if (mockData) {
            setUser(JSON.parse(mockData));
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (role: 'student' | 'teacher', formData?: any) => {
    const isSignup = !!formData.name;
    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
    const url = getApiUrl(endpoint);
    const payload = { ...formData, role };

    try {
        // 1. Try Real API
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await handleResponse(res);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            // Clear mock data if real login succeeds
            localStorage.removeItem('mock_user_data'); 
            return;
        } 
        
        // Check if it was a real logic error (like wrong password) or a 404/HTML error
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
             const errorData = await res.json();
             throw new Error(errorData.message || 'Authentication failed');
        }
        
        // If we get here, it returned HTML (404) or something else => Trigger Fallback
        throw new Error("API_UNREACHABLE");

    } catch (err: any) {
        // 2. Fallback to Mock Mode
        if (err.message === 'API_UNREACHABLE' || err.message.includes('Failed to fetch')) {
            console.warn("Backend unreachable. Using Demo Mode.");
            
            // Simulate Authentication
            const mockUser: User | Teacher = {
                uid: 'mock_' + Date.now(),
                email: formData.email,
                displayName: formData.name || 'Demo User',
                role: role,
                avatarUrl: `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=${role === 'student' ? '0D9488' : '0F172A'}&color=fff`,
                memorizedAyahs: 120,
                // Teacher specific
                bio: formData.bio || "This is a demo profile running in offline mode.",
                hourlyRate: formData.hourlyRate || 20,
                subjects: formData.subjects || ['Tajweed'],
                rating: 5.0,
                reviewsCount: 0
            };
            
            saveMockUser(mockUser);
            alert("⚠️ Backend not connected.\n\nLogged in using Demo Mode. Data will be saved locally.");
        } else {
            throw err; // Re-throw real errors (like 'User already exists')
        }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('mock_user_data');
  };

  const updateProfile = async (data: Partial<Teacher>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    try {
        const token = localStorage.getItem('token');
        
        // If using mock token, just update local storage
        if (token?.startsWith('mock_token')) {
            localStorage.setItem('mock_user_data', JSON.stringify(updatedUser));
            return;
        }

        // Otherwise try real API
        await fetch(getApiUrl('/api/users/profile'), {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    } catch (err) {
        console.error("Profile update failed (simulated success in UI)", err);
        // Ensure local persistence even if API fails
        localStorage.setItem('mock_user_data', JSON.stringify(updatedUser));
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