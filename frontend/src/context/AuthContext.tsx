'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken, clearToken } from '@/lib/api';

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatarColor?: string;
  profilePic?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  createdAt?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const { user } = await api.me();
        setUser(user);
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    router.push('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    setToken(res.token);
    setUser(res.user);
    router.push('/dashboard');
  };

  const logout = () => {
    clearToken();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
