
import React from 'react';
import { useFeeConfiguration } from './fees/useFeeConfiguration';
import CurrentFeeCard from './fees/CurrentFeeCard';
import FeeHistoryTable from './fees/FeeHistoryTable';
import FeeDialogForm from './fees/FeeDialogForm';

const FeeConfigurationSection: React.FC = () => {
  const {
    feeConfigs,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    newFeeConfig,
    setNewFeeConfig,
    createFeeConfigMutation,
    currentFeeConfig
  } = useFeeConfiguration();

  const handleSubmit = () => {
    createFeeConfigMutation.mutate(newFeeConfig);
  };
  
  return (
    <div className="space-y-6">
      <CurrentFeeCard 
        currentFeeConfig={currentFeeConfig} 
        onOpenDialog={() => setIsDialogOpen(true)} 
      />
      
      <FeeHistoryTable 
        feeConfigs={feeConfigs} 
        isLoading={isLoading} 
      />
      
      <FeeDialogForm 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        feeFormState={newFeeConfig}
        setFeeFormState={setNewFeeConfig}
        isPending={createFeeConfigMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default FeeConfigurationSection;
