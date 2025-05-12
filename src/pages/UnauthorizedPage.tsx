
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900">Acesso Negado</h1>
        <p className="text-xl text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
        <p className="text-gray-500">
          Seu nível de acesso como <span className="font-medium capitalize">{user?.role}</span> não permite visualizar este conteúdo.
        </p>
        <div className="pt-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-association-primary hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
