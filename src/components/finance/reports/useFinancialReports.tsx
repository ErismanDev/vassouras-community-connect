
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customSupabaseClient } from '@/integrations/supabase/customClient';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface TransactionProps {
  amount: number;
  transaction_date: string;
  type: 'income' | 'expense';
  category: string;
}

export const useFinancialReports = () => {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 5)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  
  // Fetch transactions for reporting
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactionsReport', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await customSupabaseClient
        .from('financial_transactions')
        .select('*')
        .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data as TransactionProps[];
    }
  });
  
  // Monthly trend data
  const monthlyData = useMemo(() => {
    if (!transactions) return [];
    
    const monthlyMap: Record<string, { month: string, income: number, expense: number, balance: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthYear = format(date, 'yyyy-MM');
      const monthDisplay = format(date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthDisplay, income: 0, expense: 0, balance: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyMap[monthYear].income += Number(transaction.amount);
      } else {
        monthlyMap[monthYear].expense += Number(transaction.amount);
      }
      
      monthlyMap[monthYear].balance = monthlyMap[monthYear].income - monthlyMap[monthYear].expense;
    });
    
    return Object.values(monthlyMap).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ').reverse();
      const [monthB, yearB] = b.month.split(' ').reverse();
      return new Date(`${monthA} ${yearA}`).getTime() - new Date(`${monthB} ${yearB}`).getTime();
    });
  }, [transactions]);
  
  // Expense breakdown by category
  const expensesByCategory = useMemo(() => {
    if (!transactions) return [];
    
    const categoryMap: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        
        categoryMap[transaction.category] += Number(transaction.amount);
      });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  // Income breakdown by category
  const incomeByCategory = useMemo(() => {
    if (!transactions) return [];
    
    const categoryMap: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        
        categoryMap[transaction.category] += Number(transaction.amount);
      });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  // Summary data
  const summaryData = useMemo(() => {
    if (!transactions) {
      return { totalIncome: 0, totalExpense: 0, balance: 0 };
    }
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);
  
  const handleExportPDF = () => {
    // In a real application, this would generate a PDF report
    alert('Esta funcionalidade geraria um relatório em PDF');
  };
  
  const handleExportExcel = () => {
    // For simplicity, we'll just export a CSV which can be opened in Excel
    if (!transactions || !transactions.length) return;
    
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'];
    const csvData = transactions.map(t => [
      format(new Date(t.transaction_date), 'dd/MM/yyyy'),
      '', // Description not included in our simplified data model
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
    link.setAttribute('download', `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    transactions,
    isLoading,
    monthlyData,
    expensesByCategory,
    incomeByCategory,
    summaryData,
    handleExportPDF,
    handleExportExcel
  };
};
