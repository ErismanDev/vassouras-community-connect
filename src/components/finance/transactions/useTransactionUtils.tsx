
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionProps } from './useTransactionData';

export const useTransactionUtils = (transactions: TransactionProps[] | undefined) => {
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

  return {
    chartData,
    categories,
    totalIncome,
    totalExpense,
    handleExportCSV
  };
};
