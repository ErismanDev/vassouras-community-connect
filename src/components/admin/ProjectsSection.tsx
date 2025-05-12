
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProjectsSection: React.FC = () => {
  const { user } = useAuth();
  const canManageProjects = user?.role === 'admin' || user?.role === 'director';
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:created_by (
            email,
            user_metadata->name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((project: any) => ({
        ...project,
        creatorName: project.creator?.user_metadata?.name || project.creator?.email?.split('@')[0] || 'Usuário',
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando projetos...</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluido':
      case 'concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Projetos e Iniciativas
          </h2>
          <p className="text-gray-500 mt-1">
            Acompanhamento de projetos e ações da associação
          </p>
        </div>
        
        {canManageProjects && (
          <Button 
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        )}
      </div>

      {!projects?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhum projeto cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project: any) => (
            <Card key={project.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    Criado por {project.creatorName} em {formatDate(project.created_at)}
                  </p>
                  <p className="mb-4">{project.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Data de início:</span>{' '}
                      {formatDate(project.start_date)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data de conclusão:</span>{' '}
                      {formatDate(project.end_date)}
                    </div>
                  </div>
                </div>
                
                {canManageProjects && (
                  <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="default" size="sm">
                      Atualizar Status
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
