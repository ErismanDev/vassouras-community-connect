
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTransactions } from './transactions/useTransactions';
import TransactionsSummary from './transactions/TransactionsSummary';
import TransactionsChart from './transactions/TransactionsChart';
import TransactionFilters from './transactions/TransactionFilters';
import TransactionsTable from './transactions/TransactionsTable';
import TransactionDialog from './transactions/TransactionDialog';

interface TransactionsSectionProps {
  isAdmin: boolean;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ isAdmin }) => {
  const {
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
  } = useTransactions();
  
  return (
    <div className="space-y-6">
      <TransactionsSummary
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />
      
      <TransactionsChart chartData={chartData} />
      
      <div className="flex justify-between items-center">
        <TransactionFilters
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onExport={handleExportCSV}
          onReset={resetFilters}
        />
        
        {isAdmin && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        )}
      </div>
      
      <TransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        isAdmin={isAdmin}
      />
      
      {isAdmin && (
        <TransactionDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={newTransaction}
          setFormData={setNewTransaction}
          onSubmit={handleCreateTransaction}
          isPending={createTransactionMutation.isPending}
        />
      )}
    </div>
  );
};

export default TransactionsSection;
