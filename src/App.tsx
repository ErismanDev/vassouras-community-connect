import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './integrations/supabase/client';
import React from 'react';

import Index from './pages/Index';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ResidentsPage from './pages/ResidentsPage';
import FinancePage from './pages/FinancePage';
import DocumentsPage from './pages/DocumentsPage';
import CommunicationPage from './pages/CommunicationPage';
import AdminPage from './pages/AdminPage';
import RequestsPage from './pages/RequestsPage';

import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Error Boundary simples
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Você pode logar o erro em um serviço externo aqui
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <h1>Ocorreu um erro inesperado.</h1>
          <pre style={{ color: 'red', marginTop: 16 }}>{String(this.state.error)}</pre>
          <p>Tente recarregar a página ou entre em contato com o suporte.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              <Route element={<ProtectedRoute allowedRoles={['resident', 'admin', 'director']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/communication" element={<CommunicationPage />} />
                  <Route path="/requests" element={<RequestsPage />} />
                </Route>
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin', 'director']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/residents" element={<ResidentsPage />} />
                </Route>
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
