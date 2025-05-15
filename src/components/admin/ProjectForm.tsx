
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  status: z.string().min(1, 'Status é obrigatório'),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  onClose: () => void;
  editingProject?: any;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, editingProject }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pendente',
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (editingProject) {
      let startDate = null;
      let endDate = null;
      
      try {
        if (editingProject.start_date) {
          startDate = new Date(editingProject.start_date);
          if (isNaN(startDate.getTime())) startDate = null;
        }
      } catch (error) {
        startDate = null;
      }
      
      try {
        if (editingProject.end_date) {
          endDate = new Date(editingProject.end_date);
          if (isNaN(endDate.getTime())) endDate = null;
        }
      } catch (error) {
        endDate = null;
      }
      
      form.reset({
        title: editingProject.title || '',
        description: editingProject.description || '',
        status: editingProject.status || 'pendente',
        startDate: startDate,
        endDate: endDate,
      });
    }
  }, [editingProject, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const projectData = {
        title: values.title,
        description: values.description,
        status: values.status,
        start_date: values.startDate ? values.startDate.toISOString().split('T')[0] : null,
        end_date: values.endDate ? values.endDate.toISOString().split('T')[0] : null,
        created_by: user?.id,
      };

      if (editingProject) {
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(editingProject ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
          </h3>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reforma da Praça Central" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes do projeto"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluído">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <DatePicker
                  date={field.value || undefined}
                  setDate={field.onChange}
                />
                <FormDescription>
                  Opcional. Deixe em branco se ainda não iniciado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Conclusão</FormLabel>
                <DatePicker
                  date={field.value || undefined}
                  setDate={field.onChange}
                />
                <FormDescription>
                  Opcional. Deixe em branco se ainda não concluído.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

export default ProjectForm;
