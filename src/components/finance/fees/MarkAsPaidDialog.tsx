
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';

interface MarkAsPaidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFeesCount: number; // This is the correct property name
  paymentDate: Date;
  setPaymentDate: (date: Date) => void;
  onMarkAsPaid: () => void;
  isLoading: boolean;
}

const MarkAsPaidDialog: React.FC<MarkAsPaidDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedFeesCount, // Using the correct property
  paymentDate,
  setPaymentDate,
  onMarkAsPaid,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Marcar como Pago</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p>
            Você está prestes a marcar <strong>{selectedFeesCount}</strong> mensalidade(s) como paga(s).
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="payment-date">Data do Pagamento</Label>
            <DatePicker
              date={paymentDate}
              setDate={(date) => date && setPaymentDate(date)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onMarkAsPaid}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsPaidDialog;
