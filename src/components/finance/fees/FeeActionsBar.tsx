
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash, 
  CreditCard, 
  CheckSquare, 
  FileText, 
  Plus, 
  Loader2 
} from 'lucide-react';

interface FeeActionsBarProps {
  selectedFees: string[];
  clearSelection: () => void;
  setIsMarkPaidDialogOpen: (isOpen: boolean) => void;
  openBatchDialog: () => void;
  selectedStatus: string;
  isBatchLoading: boolean;
}

const FeeActionsBar: React.FC<FeeActionsBarProps> = ({
  selectedFees,
  clearSelection,
  setIsMarkPaidDialogOpen,
  openBatchDialog,
  selectedStatus,
  isBatchLoading
}) => {
  const hasSelectedFees = selectedFees.length > 0;
  
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={openBatchDialog}
          className="flex items-center gap-1"
          disabled={isBatchLoading}
        >
          {isBatchLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Gerar Mensalidades
        </Button>
        
        {hasSelectedFees && (
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsMarkPaidDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <CheckSquare className="h-4 w-4" />
              Marcar como Pagas
            </Button>
            
            <Button
              variant="outline"
              onClick={clearSelection}
              className="flex items-center gap-1"
            >
              <Trash className="h-4 w-4" />
              Limpar Seleção
            </Button>
          </>
        )}
      </div>
      
      <div className="flex-1"></div>
      
      <Button variant="outline" className="flex items-center gap-1">
        <FileText className="h-4 w-4" />
        Exportar
      </Button>
    </div>
  );
};

export default FeeActionsBar;
