
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customSupabaseClient } from '@/integrations/supabase/customClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export const useTransactions = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    type: '',
    category: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    transaction_date: new Date(),
    type: 'income' as 'income' | 'expense',
    category: 'general',
    public: true,
    receiptFile: null as File | null
  });
  
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = customSupabaseClient.from('financial_transactions').select('*');
      
      if (filters.startDate) {
        query = query.gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query.order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data as TransactionProps[];
    }
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: typeof newTransaction) => {
      // Upload receipt if provided
      let receiptUrl = null;
      if (transaction.receiptFile) {
        const fileName = `${Date.now()}-${transaction.receiptFile.name}`;
        const { error: uploadError, data } = await customSupabaseClient.storage
          .from('financial_receipts')
          .upload(fileName, transaction.receiptFile);
        
        if (uploadError) throw uploadError;
        
        const publicUrl = customSupabaseClient.storage
          .from('financial_receipts')
          .getPublicUrl(fileName).data.publicUrl;
          
        receiptUrl = publicUrl;
      }
      
      // Create transaction record
      const { data, error } = await customSupabaseClient.from('financial_transactions').insert([
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
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsDialogOpen(false);
      setNewTransaction({
        description: '',
        amount: '',
        transaction_date: new Date(),
        type: 'income',
        category: 'general',
        public: true,
        receiptFile: null
      });
      toast.success('Transação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao registrar transação. Tente novamente.');
    }
  });

  // Handle chart data
  const chartData = useMemo(() => {
    if (!transactions) return [];
    
    const monthlyData: Record<string, { month: string, income: number, expense: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthYear = format(date, 'yyyy-MM');
      const monthDisplay = format(date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthDisplay, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthYear].income += Number(transaction.amount);
      } else {
        monthlyData[monthYear].expense += Number(transaction.amount);
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const [yearA, monthA] = a.month.split(' ');
      const [yearB, monthB] = b.month.split(' ');
      return new Date(`${monthA} ${yearA}`).getTime() - new Date(`${monthB} ${yearB}`).getTime();
    }).slice(-6); // Last 6 months
  }, [transactions]);
  
  const handleExportCSV = () => {
    if (!transactions || !transactions.length) return;
    
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'];
    const csvData = transactions.map(t => [
      format(new Date(t.transaction_date), 'dd/MM/yyyy'),
      t.description,
      t.amount.toString().replace('.', ','),
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      type: '',
      category: ''
    });
  };

  // Get available categories
  const categories = useMemo(() => {
    if (!transactions) return [];
    const categorySet = new Set<string>();
    transactions.forEach(t => categorySet.add(t.category));
    return Array.from(categorySet);
  }, [transactions]);
  
  const totalIncome = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);
  
  const totalExpense = useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  return {
    transactions,
    isLoading,
    chartData,
    totalIncome,
    totalExpense,
    filters,
    setFilters,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    newTransaction,
    setNewTransaction,
    createTransactionMutation,
    handleExportCSV,
    resetFilters
  };
};
