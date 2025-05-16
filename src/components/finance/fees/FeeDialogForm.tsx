
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/datepicker';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeeFormState {
  amount: number;
  startDate: Date; // Changed from start_date to startDate to match useFeeConfiguration
  description: string;
}

interface FeeDialogFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  feeFormState: FeeFormState;
  setFeeFormState: React.Dispatch<React.SetStateAction<FeeFormState>>;
  isPending: boolean;
  onSubmit: () => void;
}

const FeeDialogForm: React.FC<FeeDialogFormProps> = ({
  isOpen,
  setIsOpen,
  feeFormState,
  setFeeFormState,
  isPending,
  onSubmit
}) => {
  const { user, session } = useAuth();
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Definir Novo Valor de Mensalidade</DialogTitle>
        </DialogHeader>
        
        {(user?.role !== 'admin' || !session) && (
          <Alert variant="destructive">
            <AlertDescription>
              Você precisa ser um administrador para modificar configurações de mensalidades.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fee-amount">Valor da Mensalidade (R$)</Label>
            <Input
              id="fee-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={feeFormState.amount}
              onChange={(e) => setFeeFormState({...feeFormState, amount: Number(e.target.value)})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fee-start-date">Data de Início</Label>
            <DatePicker
              date={feeFormState.startDate}
              setDate={(date) => date && setFeeFormState({...feeFormState, startDate: date})}
            />
            <p className="text-sm text-muted-foreground">
              A partir desta data, o valor atual será substituído pelo novo valor.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fee-description">Descrição/Motivo</Label>
            <Input
              id="fee-description"
              placeholder="Ex: Ajuste anual"
              value={feeFormState.description}
              onChange={(e) => setFeeFormState({...feeFormState, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isPending || !feeFormState.amount || !feeFormState.description || !user || user.role !== 'admin' || !session}
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeeDialogForm;
