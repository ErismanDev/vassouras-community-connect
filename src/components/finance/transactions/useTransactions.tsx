
import { useState } from 'react';
import { useTransactionData } from './useTransactionData';
import { useTransactionMutations } from './useTransactionMutations';
import { useTransactionUtils } from './useTransactionUtils';

export const useTransactions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    type: 'all',
    category: 'all'
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
  const { data: transactions, isLoading } = useTransactionData(filters);
  
  // Get mutations
  const { createTransactionMutation } = useTransactionMutations();
  
  // Get utilities
  const { chartData, categories, totalIncome, totalExpense, handleExportCSV } = useTransactionUtils(transactions);

  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      type: 'all',
      category: 'all'
    });
  };

  const handleCreateTransaction = () => {
    createTransactionMutation.mutate(newTransaction, {
      onSuccess: () => {
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
      }
    });
  };

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
    resetFilters,
    handleCreateTransaction
  };
};
