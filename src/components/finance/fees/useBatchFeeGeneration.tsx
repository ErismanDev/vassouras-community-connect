
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { addMonths, startOfMonth, setDate } from 'date-fns';

export const useBatchFeeGeneration = () => {
  const queryClient = useQueryClient();
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  
  // State for batch creation
  const [batchMonth, setBatchMonth] = useState<Date>(new Date());
  const [batchDueDate, setBatchDueDate] = useState<Date>(
    setDate(addMonths(new Date(), 1), 10) // Default to 10th of next month
  );

  // Batch fee creation using stored procedure
  const batchFeeMutation = useMutation({
    mutationFn: async () => {
      // Format dates for the PostgreSQL function
      const referenceMonth = format(startOfMonth(batchMonth), 'yyyy-MM-dd');
      const dueDate = format(batchDueDate, 'yyyy-MM-dd');
      
      // Call the stored procedure via RPC
      const { data, error } = await supabase.rpc(
        'generate_monthly_fees_batch',
        { 
          p_reference_month: referenceMonth,
          p_due_date: dueDate,
          p_description: `Mensalidade ${format(batchMonth, 'MMMM yyyy')}`
        }
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      
      if (data && data.inserted_count > 0) {
        toast.success(
          `${data.inserted_count} mensalidades geradas com sucesso para ${data.month_year}. Valor total: R$ ${Number(data.total_amount).toFixed(2).replace('.', ',')}`
        );
      } else {
        toast.info('Não há novos moradores para gerar mensalidades.');
      }
      
      setIsBatchDialogOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao gerar mensalidades:', error);
      
      let errorMessage = 'Erro ao gerar mensalidades.';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      toast.error(errorMessage);
    }
  });

  return {
    isBatchDialogOpen,
    setIsBatchDialogOpen,
    batchMonth,
    setBatchMonth,
    batchDueDate,
    setBatchDueDate,
    batchFeeMutation
  };
};
