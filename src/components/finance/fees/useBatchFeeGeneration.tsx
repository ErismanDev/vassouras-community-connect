
import { useState } from 'react';
import { addMonths, format, startOfMonth } from 'date-fns'; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBatchFeeGeneration = () => {
  const queryClient = useQueryClient();
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  
  // Mutation for batch generating fees
  const {
    mutate: generateMonthlyFeesBatch,
    isPending: isBatchLoading,
    data: batchResult
  } = useMutation({
    mutationFn: async ({
      referenceMonth,
      dueDate,
      description
    }: {
      referenceMonth: Date;
      dueDate: Date;
      description?: string;
    }) => {
      // Format dates to ISO string (YYYY-MM-DD)
      const refMonthStr = format(startOfMonth(referenceMonth), 'yyyy-MM-dd');
      const dueDateStr = format(dueDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase.rpc('generate_monthly_fees_batch', {
        p_reference_month: refMonthStr,
        p_due_date: dueDateStr,
        p_description: description || null
      });
      
      if (error) {
        console.error('Error generating monthly fees:', error);
        throw new Error(error.message || 'Falha ao gerar as mensalidades');
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      setIsBatchDialogOpen(false);
      
      const insertedCount = data?.[0]?.inserted_count || 0;
      const totalAmount = data?.[0]?.total_amount || 0;
      const monthYear = data?.[0]?.month_year || '';
      
      toast.success(
        `${insertedCount} mensalidades geradas com sucesso para ${monthYear}. Valor total: R$ ${Number(totalAmount).toFixed(2).replace('.', ',')}`
      );
    },
    onError: (error: Error) => {
      console.error('Error in batch generation:', error);
      toast.error(`Erro ao gerar mensalidades: ${error.message}`);
    }
  });
  
  return {
    isBatchDialogOpen,
    setIsBatchDialogOpen,
    generateMonthlyFeesBatch,
    isBatchLoading,
    batchResult
  };
};
