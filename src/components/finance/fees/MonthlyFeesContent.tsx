
import React from 'react';
import FeeTable from './FeeTable';
import FeeFilters from './FeeFilters';
import FeeActionsBar from './FeeActionsBar';
import { MonthlyFee } from './useMonthlyFees';

interface MonthlyFeesContentProps {
  monthlyFees: MonthlyFee[] | undefined;
  isLoading: boolean;
  selectedMonth: Date | undefined;
  setSelectedMonth: (date: Date | undefined) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedFees: string[];
  clearSelection: () => void;
  setIsMarkPaidDialogOpen: (isOpen: boolean) => void;
  openBatchDialog: () => void;
  isBatchLoading: boolean;
  openIndividualDialog: () => void;
  selectAllPendingFees: () => void;
  toggleFeeSelection: (feeId: string) => void;
  resetFilters: () => void;
}

const MonthlyFeesContent: React.FC<MonthlyFeesContentProps> = ({
  monthlyFees,
  isLoading,
  selectedMonth,
  setSelectedMonth,
  selectedStatus,
  setSelectedStatus,
  selectedFees,
  clearSelection,
  setIsMarkPaidDialogOpen,
  openBatchDialog,
  isBatchLoading,
  openIndividualDialog,
  selectAllPendingFees,
  toggleFeeSelection,
  resetFilters
}) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default MonthlyFeesContent;
