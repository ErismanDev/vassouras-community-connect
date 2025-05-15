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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  assemblyDate: z.date({
    required_error: "Data da assembleia é obrigatória",
  }),
  decisionText: z.string().min(10, 'O texto da decisão deve ter pelo menos 10 caracteres'),
  votesFor: z.number().int().min(0, 'Votos a favor não pode ser negativo'),
  votesAgainst: z.number().int().min(0, 'Votos contra não pode ser negativo'),
  votesAbstain: z.number().int().min(0, 'Abstenções não pode ser negativo'),
  approved: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface DecisionFormProps {
  onClose: () => void;
  editingDecision?: any;
}

const DecisionForm: React.FC<DecisionFormProps> = ({ onClose, editingDecision }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      assemblyDate: new Date(),
      decisionText: '',
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      approved: false,
    },
  });

  useEffect(() => {
    if (editingDecision) {
      let assemblyDate;
      try {
        assemblyDate = editingDecision.assembly_date ? new Date(editingDecision.assembly_date) : new Date();
        if (isNaN(assemblyDate.getTime())) {
          assemblyDate = new Date();
        }
      } catch (error) {
        assemblyDate = new Date();
      }
      
      form.reset({
        title: editingDecision.title || '',
        assemblyDate: assemblyDate,
        decisionText: editingDecision.decision_text || '',
        votesFor: editingDecision.votes_for || 0,
        votesAgainst: editingDecision.votes_against || 0,
        votesAbstain: editingDecision.votes_abstain || 0,
        approved: editingDecision.approved || false,
      });
    }
  }, [editingDecision, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const decisionData = {
        title: values.title,
        assembly_date: values.assemblyDate.toISOString().split('T')[0],
        decision_text: values.decisionText,
        votes_for: values.votesFor,
        votes_against: values.votesAgainst,
        votes_abstain: values.votesAbstain,
        approved: values.approved,
        created_by: user?.id,
      };

      if (editingDecision) {
        const { data, error } = await supabase
          .from('assembly_decisions')
          .update(decisionData)
          .eq('id', editingDecision.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('assembly_decisions')
          .insert(decisionData)
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assemblyDecisions'] });
      toast.success(editingDecision ? 'Decisão atualizada com sucesso!' : 'Decisão criada com sucesso!');
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
            {editingDecision ? 'Editar Decisão de Assembleia' : 'Nova Decisão de Assembleia'}
          </h3>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da decisão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assemblyDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Assembleia</FormLabel>
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
          name="decisionText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto da Decisão</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o texto da decisão tomada na assembleia"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="votesFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votos a Favor</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="votesAgainst"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votos Contra</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="votesAbstain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstenções</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="approved"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Decisão Aprovada
                </FormLabel>
                <FormDescription>
                  Marque se a proposta foi aprovada na assembleia
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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

export default DecisionForm;
