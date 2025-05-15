import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export interface FeeConfig {
  id: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  description: string;
  created_at: string;
  created_by: string;
}

export const useFeeConfiguration = () => {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeeConfig, setNewFeeConfig] = useState({
    amount: '',
    start_date: new Date(),
    description: ''
  });
  
  // Fetch fee configurations
  const { data: feeConfigs, isLoading } = useQuery({
    queryKey: ['feeConfigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_configuration')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching fee configs:', error);
        throw error;
      }
      return data as FeeConfig[];
    },
    retry: 1
  });
  
  // Create fee configuration mutation
  const createFeeConfigMutation = useMutation({
    mutationFn: async (feeConfig: typeof newFeeConfig) => {
      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Você precisa estar autenticado para atualizar configurações de mensalidades');
      }

      // Atualizar a configuração ativa, se existir
      const { data: activeConfig, error: findError } = await supabase
        .from('fee_configuration')
        .select('id')
        .is('end_date', null)
        .single();

      if (findError && findError.code !== 'PGRST116') { // Not found is ok
        throw findError;
      }

      if (activeConfig) {
        const { error: updateError } = await supabase
          .from('fee_configuration')
          .update({ end_date: format(new Date(feeConfig.start_date), 'yyyy-MM-dd') })
          .eq('id', activeConfig.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Inserir nova configuração de mensalidade
      const { data, error } = await supabase
        .from('fee_configuration')
        .insert([
          {
            amount: parseFloat(feeConfig.amount),
            start_date: format(feeConfig.start_date, 'yyyy-MM-dd'),
            description: feeConfig.description
            // Não envia created_by, user_id, owner_id, auth_id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeConfigs'] });
      setIsDialogOpen(false);
      setNewFeeConfig({
        amount: '',
        start_date: new Date(),
        description: ''
      });
      toast.success('Valor de mensalidade atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating fee config:', error);
      let errorMsg = 'Erro ao atualizar valor da mensalidade.';
      
      if (error.message) {
        if (error.message.includes('row-level security policy')) {
          errorMsg += ' Você não tem permissão para esta operação. Verifique se você está logado como administrador.';
        } else {
          errorMsg += ' ' + error.message;
        }
      }
      
      toast.error(errorMsg);
    }
  });
  
  // Get current fee configuration
  const currentFeeConfig = feeConfigs?.find(config => config.end_date === null);

  return {
    feeConfigs,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    newFeeConfig,
    setNewFeeConfig,
    createFeeConfigMutation,
    currentFeeConfig
  };
};
