
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Pencil, Trash2, GavelIcon, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import DecisionForm from './DecisionForm';
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

const AssemblyDecisionsSection: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<any>(null);
  const [viewingDecision, setViewingDecision] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: decisions, isLoading } = useQuery({
    queryKey: ['assemblyDecisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assembly_decisions')
        .select('*')
        .order('assembly_date', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assembly_decisions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assemblyDecisions'] });
      toast.success('Decisão removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover decisão: ${error.message}`);
    },
  });

  const handleEdit = (decision: any) => {
    setEditingDecision(decision);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingDecision(null);
    }, 100);
  };

  const formatDate = (dateString: string) => {
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
        <span className="ml-2 text-lg font-medium">Carregando decisões...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <GavelIcon className="h-6 w-6" />
            Decisões de Assembleia
          </h2>
          <p className="text-gray-500 mt-1">
            Gerenciar decisões tomadas em assembleias
          </p>
        </div>
        {isAdmin && !isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Decisão
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card>
          <CardContent className="pt-6">
            <DecisionForm 
              onClose={handleFormClose} 
              editingDecision={editingDecision}
            />
          </CardContent>
        </Card>
      )}

      {!isFormOpen && (
        <Card>
          <CardContent className="p-0">
            {decisions && decisions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Votos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decisions.map((decision) => (
                    <TableRow key={decision.id}>
                      <TableCell>{formatDate(decision.assembly_date)}</TableCell>
                      <TableCell className="font-medium">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-left justify-start hover:no-underline"
                              onClick={() => setViewingDecision(decision)}
                            >
                              {decision.title}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {viewingDecision?.title} - {viewingDecision && formatDate(viewingDecision.assembly_date)}
                              </DialogTitle>
                              <DialogDescription>
                                Decisão de assembleia
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Texto da decisão:</h4>
                              <p className="whitespace-pre-wrap">{viewingDecision?.decision_text}</p>
                              
                              <div className="mt-4 flex space-x-4">
                                <div className="flex items-center">
                                  <ThumbsUp className="h-5 w-5 mr-1 text-green-500" />
                                  <span className="text-sm font-medium">{viewingDecision?.votes_for || 0} a favor</span>
                                </div>
                                <div className="flex items-center">
                                  <ThumbsDown className="h-5 w-5 mr-1 text-red-500" />
                                  <span className="text-sm font-medium">{viewingDecision?.votes_against || 0} contra</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">{viewingDecision?.votes_abstain || 0} abstenções</span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Badge variant={decision.approved ? "success" : "default"}>
                          {decision.approved ? "Aprovada" : "Não aprovada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-xs">{decision.votes_for}</span>
                          </div>
                          <div className="flex items-center">
                            <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                            <span className="text-xs">{decision.votes_against}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(decision)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja excluir esta decisão?')) {
                                    deleteMutation.mutate(decision.id);
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
                <p className="text-gray-500">Nenhuma decisão cadastrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssemblyDecisionsSection;
