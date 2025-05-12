
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'director' | 'resident';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Mock authentication functions (to be replaced with real API calls)
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!email || !password) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      // In a real app, this would be verified against a backend
      // Mock users for development
      const users: Record<string, User> = {
        'admin@example.com': { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        'director@example.com': { id: '2', name: 'Director User', email: 'director@example.com', role: 'director' },
        'resident@example.com': { id: '3', name: 'Resident User', email: 'resident@example.com', role: 'resident' }
      };
      
      const mockUser = users[email];
      if (!mockUser || password !== 'password123') {
        throw new Error('E-mail ou senha inválidos');
      }
      
      // Set user in state and localStorage
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Falha ao fazer login');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!name || !email || !password) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      // In a real app, this would create a user in the backend
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        role,
      };
      
      // Set user in state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Registro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Falha ao registrar');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logout realizado');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
