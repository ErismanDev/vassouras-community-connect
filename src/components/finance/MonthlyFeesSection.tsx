
import React, { useState } from 'react';
import { useMonthlyFees } from './fees/useMonthlyFees';
import { toast } from 'sonner';
import FeeTable from './fees/FeeTable';
import FeeFilters from './fees/FeeFilters';
import FeeActionsBar from './fees/FeeActionsBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import CurrentFeeCard from './fees/CurrentFeeCard';
import FeeHistoryTable from './fees/FeeHistoryTable';
import FeeReceiptBook from './fees/FeeReceiptBook';
import BatchFeeDialog from './fees/BatchFeeDialog';
import MarkAsPaidDialog from './fees/MarkAsPaidDialog';
import IndividualFeeForm from './fees/IndividualFeeForm';
import FeeDashboard from './fees/FeeDashboard';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

// Import the useFeeConfiguration hook to get the fee history
import { useFeeConfiguration } from './fees/useFeeConfiguration';

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
  
  // Use the fee configuration hook to get fee history
  const { feeConfigs, isLoading: isLoadingFeeConfigs, openDialog } = useFeeConfiguration();
  
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
  
  // Prepare receipt data
  const printableFees = monthlyFees?.map(fee => ({
    id: fee.id,
    user_name: fee.user_name || 'Desconhecido',
    reference_month: format(new Date(fee.reference_month), 'MMMM yyyy', { locale: ptBR }),
    amount: fee.amount,
    due_date: fee.due_date,
  })) || [];

  // Handle batch generation with support for all months
  const handleBatchGeneration = (options: { generateAllMonths: boolean, amount?: number }) => {
    generateMonthlyFeesBatch({
      referenceMonth: selectedMonth || new Date(),
      dueDate: paymentDate,
      description: "Mensalidade gerada automaticamente",
      generateAllMonths: options.generateAllMonths,
      customAmount: options.amount
    });
  };

  return printMode ? (
    <div className="print-only space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Carnê de Mensalidades</h2>
        <Button variant="ghost" onClick={() => setPrintMode(false)}>Voltar</Button>
      </div>
      
      <FeeReceiptBook 
        fees={printableFees} 
      />
    </div>
  ) : (
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
          <FeeFilters
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            resetFilters={resetFilters}
          />
          
          <FeeActionsBar
            selectedFees={selectedFees}
            clearSelection={clearSelection}
            setIsMarkPaidDialogOpen={setIsMarkPaidDialogOpen}
            openBatchDialog={openBatchDialog}
            selectedStatus={selectedStatus}
            isBatchLoading={isBatchLoading}
            openIndividualDialog={openIndividualDialog}
            selectAllPendingFees={selectAllPendingFees}
          />
          
          <FeeTable
            isLoading={isLoading}
            monthlyFees={monthlyFees}
            selectedFees={selectedFees}
            toggleFeeSelection={toggleFeeSelection}
            selectAllPendingFees={selectAllPendingFees}
            clearSelection={clearSelection}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <CurrentFeeCard 
            currentFeeConfig={feeConfig} 
            onOpenDialog={openDialog} 
          />
          <FeeHistoryTable 
            feeConfigs={feeConfigs} 
            isLoading={isLoadingFeeConfigs} 
          />
        </TabsContent>
        
        <TabsContent value="receipts">
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-medium">Carnês de Mensalidades</h3>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setPrintMode(true)}
            >
              <PrinterIcon className="h-4 w-4" />
              Imprimir Carnês
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Clique em "Imprimir Carnês" para gerar uma versão para impressão dos carnês de mensalidade.
          </p>
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
