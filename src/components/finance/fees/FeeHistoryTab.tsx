
import React from 'react';
import CurrentFeeCard from './CurrentFeeCard';
import FeeHistoryTable from './FeeHistoryTable';
import { useFeeConfiguration } from './useFeeConfiguration';

interface FeeHistoryTabProps {
  feeConfig: any;
}

const FeeHistoryTab: React.FC<FeeHistoryTabProps> = ({ feeConfig }) => {
  const { feeConfigs, isLoading: isLoadingFeeConfigs, openDialog } = useFeeConfiguration();

  return (
    <div className="space-y-6">
      <CurrentFeeCard 
        currentFeeConfig={feeConfig} 
        onOpenDialog={openDialog} 
      />
      <FeeHistoryTable 
        feeConfigs={feeConfigs} 
        isLoading={isLoadingFeeConfigs} 
      />
    </div>
  );
};

export default FeeHistoryTab;
