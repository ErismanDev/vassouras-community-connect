
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface TransactionProps {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  type: 'income' | 'expense';
  category: string;
  created_at: string;
  receipt_url?: string;
  public: boolean;
}

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type: string;
  category: string;
}

export const useTransactionData = (filters: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase.from('financial_transactions').select('*');
      
      if (filters.startDate) {
        query = query.gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query.order('transaction_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      return data as TransactionProps[];
    },
    retry: 1
  });
};
