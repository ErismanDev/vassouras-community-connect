
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Home, Users, MessageSquare, FileText, BarChart } from 'lucide-react';

const DashboardLayout: React.FC = () => {
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
        
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive
                    ? 'bg-association-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Início</span>
            </NavLink>
            
            {(user?.role === 'admin' || user?.role === 'director') && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive
                      ? 'bg-association-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Administração</span>
              </NavLink>
            )}
            
            {user?.role === 'admin' && (
              <NavLink
                to="/residents"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive
                      ? 'bg-association-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Moradores</span>
              </NavLink>
            )}
            
            <NavLink
              to="/communication"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive
                    ? 'bg-association-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Comunicação</span>
            </NavLink>
            
            <NavLink
              to="/finance"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive
                    ? 'bg-association-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <BarChart className="mr-2 h-4 w-4" />
              <span>Finanças</span>
            </NavLink>
            
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive
                    ? 'bg-association-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Documentos</span>
            </NavLink>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <div className="flex-grow">
        <Outlet />
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
