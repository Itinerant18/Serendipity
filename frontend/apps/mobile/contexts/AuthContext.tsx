import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authManager, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: { name: string; email: string; password: string; mobile?: string }) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authManager.loadUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const userData = await authManager.login(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    mobile?: string;
  }): Promise<User> => {
    const newUser = await authManager.register(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authManager.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: authManager.isAuthenticated(),
    isAdmin: authManager.isAdmin(),
    isSeller: authManager.isSeller(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};