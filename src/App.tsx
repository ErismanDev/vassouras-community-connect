
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
import ErrorBoundary from './components/common/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
                  <Route path="/dashboard" element={
                    <ErrorBoundary>
                      <DashboardPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/residents" element={
                    <ErrorBoundary>
                      <ResidentsPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/finance" element={
                    <ErrorBoundary>
                      <FinancePage />
                    </ErrorBoundary>
                  } />
                  <Route path="/documents" element={
                    <ErrorBoundary>
                      <DocumentsPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/communication" element={
                    <ErrorBoundary>
                      <CommunicationPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/requests" element={
                    <ErrorBoundary>
                      <RequestsPage />
                    </ErrorBoundary>
                  } />
                </Route>
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={
                    <ErrorBoundary>
                      <AdminPage />
                    </ErrorBoundary>
                  } />
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
