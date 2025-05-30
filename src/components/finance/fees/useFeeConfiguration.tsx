
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeeConfig {
  id: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  description: string;
  created_at: string;
  created_by: string;
}

// This interface needs to match FeeFormState in FeeDialogForm.tsx
interface NewFeeConfigState {
  amount: number;
  startDate: Date;  // Using startDate consistently
  description: string;
}

export const useFeeConfiguration = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeeConfig, setNewFeeConfig] = useState<NewFeeConfigState>({
    amount: 0,
    startDate: new Date(),
    description: ''
  });
  
  // Fetch fee configurations
  const { data: feeConfigs = [], isLoading } = useQuery({
    queryKey: ['feeConfigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_configuration')
        .select('*')
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      
      return data as FeeConfig[];
    }
  });
  
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Create new fee configuration
  const createFeeConfigMutation = useMutation({
    mutationFn: async ({ amount, startDate, description }: NewFeeConfigState) => {
      // End current active fee config
      const { data: currentConfig } = await supabase
        .from('fee_configuration')
        .select('*')
        .is('end_date', null)
        .order('start_date', { ascending: false })
        .limit(1);
      
      if (currentConfig && currentConfig.length > 0) {
        await supabase
          .from('fee_configuration')
          .update({ end_date: startDate.toISOString().split('T')[0] })
          .eq('id', currentConfig[0].id);
      }
      
      // Create new fee config
      const { data, error } = await supabase
        .from('fee_configuration')
        .insert([
          {
            amount: amount,
            start_date: startDate.toISOString().split('T')[0],
            end_date: null,
            description: description
          }
        ])
        .select();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeConfigs'] });
      toast.success('Valor da mensalidade atualizado com sucesso!');
      closeDialog();
    },
    onError: (error) => {
      console.error('Error updating fee configuration:', error);
      toast.error('Erro ao atualizar valor da mensalidade.');
    }
  });
  
  // For current fee, use the first one with null end_date
  const currentFeeConfig = feeConfigs.find(fee => fee.end_date === null) || (feeConfigs.length > 0 ? feeConfigs[0] : null);
  
  return {
    feeConfigs,
    isLoading,
    currentFeeConfig,
    isDialogOpen,
    setIsDialogOpen,
    newFeeConfig,
    setNewFeeConfig,
    openDialog,
    closeDialog,
    createFeeConfig: createFeeConfigMutation.mutate,
    createFeeConfigMutation,
    isCreating: createFeeConfigMutation.isPending
  };
};
