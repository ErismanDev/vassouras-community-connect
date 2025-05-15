
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'director' | 'resident';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  data: {
    user: SupabaseUser;
    session: Session | null;
  } | null;
  error: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session and set up listener
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        if (currentSession?.user) {
          const { id, email, user_metadata } = currentSession.user;
          const userData: User = {
            id,
            name: user_metadata?.name || email?.split('@')[0] || 'Usuário',
            email: email || '',
            role: user_metadata?.role || 'resident',
          };
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          const { id, email, user_metadata } = sessionData.session.user;
          const userData: User = {
            id,
            name: user_metadata?.name || email?.split('@')[0] || 'Usuário',
            email: email || '',
            role: user_metadata?.role || 'resident',
          };
          setUser(userData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    // Initialize auth
    initializeAuth();

    // Clean up on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (data?.session) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Full login error:', error);
      let errorMessage = 'Falha ao fazer login';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
      } else if (error.message?.includes('invalid api key')) {
        errorMessage = 'Erro de configuração. Por favor contate o administrador.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<AuthResponse> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Falha ao registrar');
        return { data: null, error };
      }
      
      if (data) {
        toast.success('Registro realizado com sucesso!');
        navigate('/dashboard');
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Full registration error:', error);
      let errorMessage = 'Falha ao registrar';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este e-mail já está registrado.';
      } else if (error.message?.includes('invalid api key')) {
        errorMessage = 'Erro de configuração. Por favor contate o administrador.';
      }
      
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage, status: 400 } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.info('Logout realizado');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Falha ao sair');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
