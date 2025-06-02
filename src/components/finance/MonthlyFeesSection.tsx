
import React, { useState } from 'react';
import { useMonthlyFees } from './fees/useMonthlyFees';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeeDashboard from './fees/FeeDashboard';
import MonthlyFeesContent from './fees/MonthlyFeesContent';
import FeeHistoryTab from './fees/FeeHistoryTab';
import FeeReceiptsTab from './fees/FeeReceiptsTab';
import BatchFeeDialog from './fees/BatchFeeDialog';
import MarkAsPaidDialog from './fees/MarkAsPaidDialog';
import IndividualFeeForm from './fees/IndividualFeeForm';

const MonthlyFeesSection: React.FC = () => {
  const {
    monthlyFees,
    isLoading,
    totalFees,
    paidFees,
    pendingFees,
    overdueFees,
    totalAmount,
    collectedAmount,
    pendingAmount,
    selectedMonth,
    setSelectedMonth,
    selectedStatus,
    setSelectedStatus,
    selectedFees,
    setSelectedFees,
    paymentDate,
    setPaymentDate,
    isMarkPaidDialogOpen,
    setIsMarkPaidDialogOpen,
    feeConfig,
    residents,
    markFeesAsPaidMutation,
    toggleFeeSelection,
    selectAllPendingFees,
    clearSelection,
    resetFilters,
    isBatchDialogOpen,
    setIsBatchDialogOpen,
    generateMonthlyFeesBatch,
    isBatchLoading
  } = useMonthlyFees();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [printMode, setPrintMode] = useState(false);
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  
  const handleMarkAsPaid = () => {
    if (selectedFees.length === 0) {
      toast.error('Selecione pelo menos uma mensalidade para marcar como paga.');
      return;
    }
    
    markFeesAsPaidMutation.mutate({ 
      feeIds: selectedFees,
      paymentDate 
    });
  };
  
  const openBatchDialog = () => {
    setIsBatchDialogOpen(true);
  };

  const openIndividualDialog = () => {
    setIsIndividualDialogOpen(true);
  };

  const handleBatchGeneration = (options: { generateAllMonths: boolean, amount?: number }) => {
    generateMonthlyFeesBatch({
      referenceMonth: selectedMonth || new Date(),
      dueDate: paymentDate,
      description: "Mensalidade gerada automaticamente",
      generateAllMonths: options.generateAllMonths,
      customAmount: options.amount
    });
  };

  return (
    <div className="space-y-6">
      <FeeDashboard
        totalFees={totalFees}
        totalAmount={totalAmount}
        paidFees={paidFees}
        collectedAmount={collectedAmount}
        pendingFees={pendingFees}
        overdueFees={overdueFees}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Gestão de Mensalidades</TabsTrigger>
          <TabsTrigger value="history">Histórico de Valores</TabsTrigger>
          <TabsTrigger value="receipts">Carnês</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <MonthlyFeesContent
            monthlyFees={monthlyFees}
            isLoading={isLoading}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedFees={selectedFees}
            clearSelection={clearSelection}
            setIsMarkPaidDialogOpen={setIsMarkPaidDialogOpen}
            openBatchDialog={openBatchDialog}
            isBatchLoading={isBatchLoading}
            openIndividualDialog={openIndividualDialog}
            selectAllPendingFees={selectAllPendingFees}
            toggleFeeSelection={toggleFeeSelection}
            resetFilters={resetFilters}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <FeeHistoryTab feeConfig={feeConfig} />
        </TabsContent>
        
        <TabsContent value="receipts">
          <FeeReceiptsTab
            monthlyFees={monthlyFees}
            printMode={printMode}
            setPrintMode={setPrintMode}
          />
        </TabsContent>
      </Tabs>

      <BatchFeeDialog
        isOpen={isBatchDialogOpen}
        onOpenChange={setIsBatchDialogOpen}
        batchMonth={selectedMonth || new Date()}
        setBatchMonth={(date) => setSelectedMonth(date)}
        batchDueDate={paymentDate}
        setBatchDueDate={setPaymentDate}
        feeConfig={feeConfig}
        residentsCount={residents?.length || 0}
        onSubmit={() => handleBatchGeneration({ generateAllMonths: false })}
        isSubmitting={isBatchLoading}
        onGenerate={handleBatchGeneration}
      />
      
      <MarkAsPaidDialog
        isOpen={isMarkPaidDialogOpen}
        onOpenChange={setIsMarkPaidDialogOpen}
        selectedFeesCount={selectedFees.length}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        onMarkAsPaid={handleMarkAsPaid}
        isLoading={markFeesAsPaidMutation.isPending}
      />

      <IndividualFeeForm
        isOpen={isIndividualDialogOpen}
        onOpenChange={setIsIndividualDialogOpen}
      />
    </div>
  );
};

export default MonthlyFeesSection;
