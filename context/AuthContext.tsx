import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      data: { email, password, name },
    });
    
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  const logout = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (currentRefreshToken) {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        data: { refreshToken: currentRefreshToken },
      }).catch(() => {}); // Ignore error on logout
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const updateProfile = async (name: string) => {
    const updatedUser = await apiFetch('/api/users/me', {
      method: 'PATCH',
      data: { name },
    });
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const data = await apiFetch('/api/users/me/password', {
      method: 'PUT',
      data: { currentPassword, newPassword },
    });
    
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile, changePassword }}>
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