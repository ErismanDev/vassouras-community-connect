
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface NewTransaction {
  description: string;
  amount: string;
  transaction_date: Date;
  type: 'income' | 'expense';
  category: string;
  public: boolean;
  receiptFile: File | null;
}

export const useTransactionMutations = () => {
  const queryClient = useQueryClient();

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: NewTransaction) => {
      // Upload receipt if provided
      let receiptUrl = null;
      if (transaction.receiptFile) {
        const fileName = `${Date.now()}-${transaction.receiptFile.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('financial_receipts')
          .upload(fileName, transaction.receiptFile);
        
        if (uploadError) {
          console.error('Receipt upload error:', uploadError);
          throw uploadError;
        }
        
        const publicUrl = supabase.storage
          .from('financial_receipts')
          .getPublicUrl(fileName).data.publicUrl;
          
        receiptUrl = publicUrl;
      }
      
      // Create transaction record
      const { data, error } = await supabase.from('financial_transactions').insert([
        {
          description: transaction.description,
          amount: parseFloat(transaction.amount),
          transaction_date: format(transaction.transaction_date, 'yyyy-MM-dd'),
          type: transaction.type,
          category: transaction.category,
          receipt_url: receiptUrl,
          public: transaction.public
        }
      ]).select();
      
      if (error) {
        console.error('Transaction creation error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao registrar transação. Tente novamente.');
    }
  });

  return { createTransactionMutation };
};
