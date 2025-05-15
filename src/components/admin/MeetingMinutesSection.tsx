
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Pencil, Trash2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MeetingMinutesForm from './MeetingMinutesForm';
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
  DialogClose,
} from '@/components/ui/dialog';

const MeetingMinutesSection: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMinute, setEditingMinute] = useState<any>(null);
  const [viewContent, setViewContent] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: meetingMinutes, isLoading } = useQuery({
    queryKey: ['meetingMinutes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meeting_minutes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetingMinutes'] });
      toast.success('Ata removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover ata: ${error.message}`);
    },
  });

  const handleEdit = (minute: any) => {
    setEditingMinute(minute);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingMinute(null);
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
        <span className="ml-2 text-lg font-medium">Carregando atas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Atas de Reunião
          </h2>
          <p className="text-gray-500 mt-1">
            Gerenciar atas de reuniões da associação
          </p>
        </div>
        {isAdmin && !isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Ata
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card>
          <CardContent className="pt-6">
            <MeetingMinutesForm 
              onClose={handleFormClose} 
              editingMinute={editingMinute}
            />
          </CardContent>
        </Card>
      )}

      {!isFormOpen && (
        <Card>
          <CardContent className="p-0">
            {meetingMinutes && meetingMinutes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data da Reunião</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetingMinutes.map((minute) => (
                    <TableRow key={minute.id}>
                      <TableCell>{formatDate(minute.meeting_date)}</TableCell>
                      <TableCell className="font-medium">{minute.title}</TableCell>
                      <TableCell>
                        {minute.document_url && (
                          <a 
                            href={minute.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center text-blue-500 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span>Baixar</span>
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setViewContent(minute)}
                            >
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {viewContent?.title} - {viewContent && formatDate(viewContent.meeting_date)}
                              </DialogTitle>
                              <DialogDescription>
                                Ata de reunião
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 whitespace-pre-wrap">
                              {viewContent?.content}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(minute)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja excluir esta ata?')) {
                                    deleteMutation.mutate(minute.id);
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
                <p className="text-gray-500">Nenhuma ata cadastrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingMinutesSection;
