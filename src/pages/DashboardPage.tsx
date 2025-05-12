
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { MessageSquare, ClipboardList, Users, Calendar } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Role-specific UI elements
  const renderAdminCards = () => (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => navigate('/residents')}>
        <CardHeader>
          <CardTitle>Gerenciar Moradores</CardTitle>
          <CardDescription>
            Cadastre e gerencie todos os moradores da associação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Acessar</Button>
        </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/admin')}>
        <CardHeader>
          <CardTitle>Gestão Administrativa</CardTitle>
          <CardDescription>
            Gerencie a diretoria, projetos, atas e assembleias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Acessar</Button>
        </CardContent>
      </Card>
    </>
  );
  
  const renderDirectorCards = () => (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/admin')}>
        <CardHeader>
          <CardTitle>Gestão Administrativa</CardTitle>
          <CardDescription>
            Gerencie projetos, atas e assembleias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Acessar</Button>
        </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>
            Gerencie eventos da associação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Acessar</Button>
        </CardContent>
      </Card>
    </>
  );
  
  const renderResidentCards = () => (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Meus Dados</CardTitle>
          <CardDescription>
            Visualize e atualize seus dados cadastrais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Acessar</Button>
        </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Acesse documentos importantes da associação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Acessar</Button>
        </CardContent>
      </Card>
    </>
  );
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">
          Painel de controle da Associação de Moradores
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Role-specific cards */}
        {user?.role === 'admin' && renderAdminCards()}
        {user?.role === 'director' && renderDirectorCards()}
        {user?.role === 'resident' && renderResidentCards()}
        
        {/* Common cards for all users */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/communication')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Comunicação</CardTitle>
            </div>
            <CardDescription>
              Acesse os comunicados da associação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Acessar</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Eventos</CardTitle>
            </div>
            <CardDescription>
              Veja os próximos eventos da associação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Acessar</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
