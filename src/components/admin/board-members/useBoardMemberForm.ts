
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  userId: z.string().min(1, 'Selecione um usuário'),
  position: z.string().min(3, 'O cargo deve ter pelo menos 3 caracteres'),
  termStart: z.date({
    required_error: "Data de início é obrigatória",
  }),
  termEnd: z.date().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export const useBoardMemberForm = (onClose: () => void, editingMember?: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserInfo, setSelectedUserInfo] = useState<{name?: string; email: string} | null>(null);
  const isMounted = useRef(true);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      position: '',
      termStart: new Date(),
      bio: '',
      photoUrl: '',
    },
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (editingMember) {
      // Garantir que as datas sejam objetos Date válidos
      let termStart = null;
      let termEnd = null;
      
      try {
        termStart = editingMember.term_start ? new Date(editingMember.term_start) : new Date();
        if (isNaN(termStart.getTime())) {
          termStart = new Date();
        }
      } catch (error) {
        console.error('Erro ao processar data de início:', error);
        termStart = new Date();
      }
      
      try {
        termEnd = editingMember.term_end ? new Date(editingMember.term_end) : undefined;
        if (termEnd && isNaN(termEnd.getTime())) {
          termEnd = undefined;
        }
      } catch (error) {
        console.error('Erro ao processar data de fim:', error);
        termEnd = undefined;
      }
      
      form.reset({
        userId: editingMember.user_id || '',
        position: editingMember.position || '',
        termStart: termStart,
        termEnd: termEnd,
        bio: editingMember.bio || '',
        photoUrl: editingMember.photo_url || '',
      });
    }
  }, [editingMember, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const memberData = {
        user_id: values.userId,
        position: values.position,
        term_start: values.termStart?.toISOString().split('T')[0],
        term_end: values.termEnd ? values.termEnd.toISOString().split('T')[0] : null,
        bio: values.bio || null,
        photo_url: values.photoUrl || null,
      };

      if (editingMember) {
        const { data, error } = await supabase
          .from('board_members')
          .update(memberData)
          .eq('id', editingMember.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('board_members')
          .insert(memberData)
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers'] });
      toast.success(editingMember ? 'Membro atualizado com sucesso!' : 'Membro adicionado com sucesso!');
      // Esperar para o toast ser exibido antes de fechar o formulário
      setTimeout(() => {
        if (isMounted.current) {
          onClose();
        }
      }, 100);
    },
    onError: (error) => {
      toast.error(`Erro: ${(error as any).message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const handleUserDataChange = (userData: {name?: string; email: string}) => {
    setSelectedUserInfo(userData);
  };

  const safeCancel = () => {
    // Fechar o formulário com segurança para evitar erros de portais/popovers
    setTimeout(() => {
      if (isMounted.current) {
        onClose();
      }
    }, 0);
  };

  return {
    form,
    isPending: mutation.isPending,
    onSubmit,
    handleUserDataChange,
    selectedUserInfo,
    safeCancel
  };
};
