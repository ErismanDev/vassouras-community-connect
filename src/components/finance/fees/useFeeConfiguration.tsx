
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
      // If there's an active fee config, update its end_date
      const { data: activeConfig, error: findError } = await supabase
        .from('fee_configuration')
        .select('id')
        .is('end_date', null)
        .single();
      
      if (findError && findError.code !== 'PGRST116') { // Not found is ok
        console.error('Error finding active config:', findError);
        throw findError;
      }
      
      if (activeConfig) {
        const { error: updateError } = await supabase
          .from('fee_configuration')
          .update({ end_date: format(new Date(feeConfig.start_date), 'yyyy-MM-dd') })
          .eq('id', activeConfig.id);
          
        if (updateError) {
          console.error('Error updating active config:', updateError);
          throw updateError;
        }
      }
      
      // Create new fee configuration
      const { data, error } = await supabase
        .from('fee_configuration')
        .insert([
          {
            amount: parseFloat(feeConfig.amount),
            start_date: format(feeConfig.start_date, 'yyyy-MM-dd'),
            description: feeConfig.description
          }
        ]).select();
      
      if (error) {
        console.error('Error creating fee config:', error);
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
    onError: (error) => {
      console.error('Error creating fee config:', error);
      toast.error('Erro ao atualizar valor da mensalidade');
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
