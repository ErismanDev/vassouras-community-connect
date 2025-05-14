
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Pencil, UserCog } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BoardMemberForm from './BoardMemberForm';
import BoardMembersList from './BoardMembersList';

const BoardMembersSection: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: boardMembers, isLoading } = useQuery({
    queryKey: ['boardMembers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('board_members')
          .select(`
            *,
            user:user_id (
              email,
              user_metadata->name
            )
          `)
          .order('created_at');

        if (error) {
          console.error('Erro ao buscar membros da diretoria:', error);
          throw error;
        }
        
        return data?.map((member: any) => ({
          ...member,
          userName: member.user?.user_metadata?.name || member.user?.email?.split('@')[0] || 'Usuário',
          userEmail: member.user?.email || '',
        })) || [];
      } catch (error) {
        console.error('Exceção ao buscar membros da diretoria:', error);
        return [];
      }
    },
  });

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('board_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
      toast.success('Membro da diretoria removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover membro: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando diretoria...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Membros da Diretoria
          </h2>
          <p className="text-gray-500 mt-1">
            Gerenciar os membros da diretoria da associação
          </p>
        </div>
        
        {isAdmin && !isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Membro
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <Card>
          <CardContent className="pt-6">
            <BoardMemberForm 
              onClose={handleFormClose} 
              editingMember={editingMember}
            />
          </CardContent>
        </Card>
      ) : (
        <BoardMembersList 
          boardMembers={boardMembers || []} 
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? (id) => deleteMutation.mutate(id) : undefined}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default BoardMembersSection;
