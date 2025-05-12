
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Associação de Moradores
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-association-primary mb-6">
          Santa Maria das Vassouras
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8">
          Portal para gerenciamento da nossa associação comunitária. Acesse sua conta para participar das atividades do bairro.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/login')}
            className="text-lg px-6 py-6 bg-association-primary hover:bg-blue-700"
            size="lg"
          >
            Entrar
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            variant="outline"
            className="text-lg px-6 py-6"
            size="lg"
          >
            Criar Conta
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-association-primary">
                Associação de Moradores de Santa Maria das Vassouras
              </h3>
              <p className="text-gray-600 mt-1">
                Unidos pela nossa comunidade
              </p>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Todos os direitos reservados
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
