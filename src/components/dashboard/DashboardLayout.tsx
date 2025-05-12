
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 
              className="text-xl font-bold text-association-primary cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              Associação de Moradores
            </h1>
            <span className="hidden md:inline-block text-gray-400">|</span>
            <span className="hidden md:inline-block text-gray-600 font-medium">
              Santa Maria das Vassouras
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        {children}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Associação de Moradores - Santa Maria das Vassouras. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
