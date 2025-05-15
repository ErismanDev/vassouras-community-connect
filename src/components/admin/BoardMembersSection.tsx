
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
        // Fetch board members without joining with user table
        const { data: boardMembersData, error } = await supabase
          .from('board_members')
          .select('*')
          .order('created_at');

        if (error) {
          console.error('Erro ao buscar membros da diretoria:', error);
          throw error;
        }
        
        // Early return if no data to prevent undefined issues later
        if (!boardMembersData || boardMembersData.length === 0) {
          console.log('Nenhum membro da diretoria encontrado');
          return [];
        }
        
        // Process each board member with robust error handling
        const enhancedMembers = await Promise.all(
          boardMembersData.map(async (member) => {
            try {
              // Handle case where user_id might be null/undefined
              if (!member.user_id) {
                console.log('Membro sem user_id:', member.id);
                return {
                  ...member,
                  userName: 'Usuário não vinculado',
                  userEmail: '',
                };
              }
              
              // Fetch user profile data for this board member
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('id', member.user_id)
                .maybeSingle();
              
              if (userError) {
                console.warn(`Erro ao buscar usuário para membro ID ${member.id}:`, userError);
                return {
                  ...member,
                  userName: 'Usuário não encontrado',
                  userEmail: '',
                };
              }
              
              if (!userData) {
                console.warn(`Usuário não encontrado para membro ID ${member.id}`);
                return {
                  ...member,
                  userName: 'Usuário não encontrado',
                  userEmail: '',
                };
              }
              
              return {
                ...member,
                userName: userData?.email?.split('@')[0] || 'Usuário',
                userEmail: userData?.email || '',
              };
            } catch (error) {
              console.warn(`Exceção ao processar usuário para membro ID ${member.id}:`, error);
              return {
                ...member,
                userName: 'Erro ao carregar usuário',
                userEmail: '',
              };
            }
          })
        );
        
        // Ensure we always return an array, even if Promise.all somehow fails
        return Array.isArray(enhancedMembers) ? enhancedMembers : [];
      } catch (error) {
        console.error('Exceção ao buscar membros da diretoria:', error);
        // Always return an array in error cases
        return [];
      }
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  // Ensure boardMembers is always an array
  const safeBoardMembers = Array.isArray(boardMembers) ? boardMembers : [];

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
          boardMembers={safeBoardMembers} 
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? (id) => deleteMutation.mutate(id) : undefined}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default BoardMembersSection;
