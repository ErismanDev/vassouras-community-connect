
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import UserSearchSelect from './UserSearchSelect';

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

type FormValues = z.infer<typeof formSchema>;

interface BoardMemberFormProps {
  onClose: () => void;
  editingMember?: any;
}

const BoardMemberForm: React.FC<BoardMemberFormProps> = ({ onClose, editingMember }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserInfo, setSelectedUserInfo] = useState<{name: string; email: string} | null>(null);

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
    if (editingMember) {
      form.reset({
        userId: editingMember.user_id,
        position: editingMember.position,
        termStart: new Date(editingMember.term_start),
        termEnd: editingMember.term_end ? new Date(editingMember.term_end) : undefined,
        bio: editingMember.bio || '',
        photoUrl: editingMember.photo_url || '',
      });
    }
  }, [editingMember, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const memberData = {
        user_id: values.userId,
        position: values.position,
        term_start: values.termStart.toISOString().split('T')[0],
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
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro: ${(error as any).message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  const handleUserDataChange = (userData: {name: string; email: string}) => {
    setSelectedUserInfo(userData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {editingMember ? 'Editar Membro da Diretoria' : 'Adicionar Membro da Diretoria'}
          </h3>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário</FormLabel>
              <FormControl>
                <UserSearchSelect 
                  value={field.value} 
                  onChange={field.onChange}
                  onUserDataChange={handleUserDataChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Presidente, Tesoureiro, etc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="termStart"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Início do Mandato</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fim do Mandato (opcional)</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Biografia do membro da diretoria"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Foto (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="URL da foto do membro" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BoardMemberForm;
