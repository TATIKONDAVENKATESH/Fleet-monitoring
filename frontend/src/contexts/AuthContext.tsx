import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AuthResponse, Role } from '../types';
import { authApi } from '../api/services';

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persistAuth = useCallback((auth: AuthResponse) => {
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.setItem('refreshToken', auth.refreshToken);
    const u: AuthUser = {
      userId: auth.userId,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    persistAuth(data.data);
  }, [persistAuth]);

  const register = useCallback(async (name: string, email: string, password: string, role: Role) => {
    const { data } = await authApi.register({ name, email, password, role });
    persistAuth(data.data);
  }, [persistAuth]);

  /**
   * FIX B3: Pass the stored refresh token to authApi.logout().
   * The backend AuthController.logout expects a RefreshTokenRequest body
   * ({ "refreshToken": "..." }). The original call sent no body → HTTP 400.
   */
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Always clear local state even if server logout fails
    }
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};