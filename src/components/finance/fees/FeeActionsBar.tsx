
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash, 
  CheckSquare, 
  FileText, 
  Plus, 
  Loader2,
  UserPlus,
  Users
} from 'lucide-react';

interface FeeActionsBarProps {
  selectedFees: string[];
  clearSelection: () => void;
  setIsMarkPaidDialogOpen: (isOpen: boolean) => void;
  openBatchDialog: () => void;
  selectedStatus: string;
  isBatchLoading: boolean;
  openIndividualDialog?: () => void;
  selectAllPendingFees?: () => void;
}

const FeeActionsBar: React.FC<FeeActionsBarProps> = ({
  selectedFees,
  clearSelection,
  setIsMarkPaidDialogOpen,
  openBatchDialog,
  selectedStatus,
  isBatchLoading,
  openIndividualDialog,
  selectAllPendingFees
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
            <Users className="h-4 w-4" />
          )}
          Gerar em Lote
        </Button>
        
        {openIndividualDialog && (
          <Button 
            variant="outline"
            onClick={openIndividualDialog}
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Criar Individual
          </Button>
        )}
        
        {selectAllPendingFees && (
          <Button 
            variant="outline"
            onClick={selectAllPendingFees}
            className="flex items-center gap-1"
          >
            <CheckSquare className="h-4 w-4" />
            Selecionar Pendentes
          </Button>
        )}
        
        {hasSelectedFees && (
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsMarkPaidDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <CheckSquare className="h-4 w-4" />
              Dar Baixa ({selectedFees.length})
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
