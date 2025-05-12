
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, FileText, PlusCircle, Download, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const MeetingMinutesSection: React.FC = () => {
  const { user } = useAuth();
  const canManageMinutes = user?.role === 'admin' || user?.role === 'director';
  
  const { data: minutes, isLoading } = useQuery({
    queryKey: ['meetingMinutes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select(`
          *,
          creator:created_by (
            email,
            user_metadata->name
          )
        `)
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      
      return data.map((minute: any) => ({
        ...minute,
        creatorName: minute.creator?.user_metadata?.name || minute.creator?.email?.split('@')[0] || 'Usuário',
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando atas...</span>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
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
            <FileText className="h-6 w-6" />
            Atas de Reunião
          </h2>
          <p className="text-gray-500 mt-1">
            Registro das atas de reunião da associação
          </p>
        </div>
        
        {canManageMinutes && (
          <Button 
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Ata
          </Button>
        )}
      </div>

      {!minutes?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma ata cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data da Reunião</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {minutes.map((minute: any) => (
                    <TableRow key={minute.id}>
                      <TableCell className="font-medium">{minute.title}</TableCell>
                      <TableCell>{formatDate(minute.meeting_date)}</TableCell>
                      <TableCell>{minute.creatorName}</TableCell>
                      <TableCell>{formatDate(minute.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Ver detalhes"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Ver detalhes</span>
                          </Button>
                          
                          {minute.document_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Baixar documento"
                              asChild
                            >
                              <a href={minute.document_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Baixar</span>
                              </a>
                            </Button>
                          )}
                          
                          {canManageMinutes && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingMinutesSection;
