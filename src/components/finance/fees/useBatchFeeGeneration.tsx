
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
      description,
      generateAllMonths = false,
      customAmount
    }: {
      referenceMonth: Date;
      dueDate: Date;
      description?: string;
      generateAllMonths?: boolean;
      customAmount?: number;
    }) => {
      // If generating all 12 months
      if (generateAllMonths) {
        let totalInsertedCount = 0;
        let totalAmount = 0;
        const results = [];
        
        // Generate fees for each month
        for (let i = 0; i < 12; i++) {
          const currentMonth = addMonths(referenceMonth, i);
          const currentDueDate = addMonths(dueDate, i);
          
          // Format dates to ISO string (YYYY-MM-DD)
          const refMonthStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
          const dueDateStr = format(currentDueDate, 'yyyy-MM-dd');
          
          const { data, error } = await supabase.rpc('generate_monthly_fees_batch', {
            p_reference_month: refMonthStr,
            p_due_date: dueDateStr,
            p_description: description || null,
            p_custom_amount: customAmount || null
          });
          
          if (error) {
            console.error(`Error generating monthly fees for month ${i+1}:`, error);
            throw new Error(error.message || 'Falha ao gerar as mensalidades');
          }
          
          if (data && data.length > 0) {
            totalInsertedCount += data[0]?.inserted_count || 0;
            totalAmount += data[0]?.total_amount || 0;
            results.push(data[0]);
          }
        }
        
        return [{
          inserted_count: totalInsertedCount,
          total_amount: totalAmount,
          month_year: `${format(referenceMonth, 'MMMM/yyyy')} - ${format(addMonths(referenceMonth, 11), 'MMMM/yyyy')}`,
          is_annual: true
        }];
      } 
      
      // Single month generation (original behavior)
      else {
        // Format dates to ISO string (YYYY-MM-DD)
        const refMonthStr = format(startOfMonth(referenceMonth), 'yyyy-MM-dd');
        const dueDateStr = format(dueDate, 'yyyy-MM-dd');
        
        const { data, error } = await supabase.rpc('generate_monthly_fees_batch', {
          p_reference_month: refMonthStr,
          p_due_date: dueDateStr,
          p_description: description || null,
          p_custom_amount: customAmount || null
        });
        
        if (error) {
          console.error('Error generating monthly fees:', error);
          throw new Error(error.message || 'Falha ao gerar as mensalidades');
        }
        
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      setIsBatchDialogOpen(false);
      
      // Handle annual generation
      if (data[0]?.is_annual) {
        const insertedCount = data[0]?.inserted_count || 0;
        const totalAmount = data[0]?.total_amount || 0;
        const monthRange = data[0]?.month_year || '';
        
        toast.success(
          `Carnê anual gerado com sucesso! ${insertedCount} mensalidades criadas para o período ${monthRange}. Valor total: R$ ${Number(totalAmount).toFixed(2).replace('.', ',')}`
        );
        return;
      }
      
      // Handle standard single-month generation
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
