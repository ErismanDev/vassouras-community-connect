
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProjectForm from './ProjectForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'concluído':
      return 'success';
    case 'in progress':
    case 'em andamento':
      return 'warning';
    case 'pending':
    case 'pendente':
      return 'secondary';
    case 'cancelled':
    case 'cancelado':
      return 'destructive';
    default:
      return 'default';
  }
};

const ProjectsSection: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover projeto: ${error.message}`);
    },
  });

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingProject(null);
    }, 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando projetos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Projetos da Associação
          </h2>
          <p className="text-gray-500 mt-1">
            Gerenciar projetos em andamento e concluídos
          </p>
        </div>
        {isAdmin && !isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card>
          <CardContent className="pt-6">
            <ProjectForm 
              onClose={handleFormClose} 
              editingProject={editingProject}
            />
          </CardContent>
        </Card>
      )}

      {!isFormOpen && (
        <Card>
          <CardContent className="p-0">
            {projects && projects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Conclusão</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-left justify-start hover:no-underline"
                              onClick={() => setViewingProject(project)}
                            >
                              {project.title}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {viewingProject?.title}
                              </DialogTitle>
                              <DialogDescription>
                                Detalhes do projeto
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status:</h4>
                                  <Badge variant={getStatusColor(viewingProject?.status || '')}>
                                    {viewingProject?.status}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Datas:</h4>
                                  <p className="text-sm">
                                    {viewingProject?.start_date ? `Início: ${formatDate(viewingProject?.start_date)}` : 'Início: Não definido'}
                                    <br />
                                    {viewingProject?.end_date ? `Conclusão: ${formatDate(viewingProject?.end_date)}` : 'Conclusão: Não definida'}
                                  </p>
                                </div>
                              </div>
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Descrição:</h4>
                              <p className="whitespace-pre-wrap">{viewingProject?.description}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(project.start_date)}</TableCell>
                      <TableCell>{formatDate(project.end_date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(project)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
                                    deleteMutation.mutate(project.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">Nenhum projeto cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectsSection;
