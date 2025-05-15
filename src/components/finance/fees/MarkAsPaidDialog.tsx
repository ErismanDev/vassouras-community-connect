
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';

interface MarkAsPaidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFeesCount: number;
  paymentDate: Date;
  setPaymentDate: (date: Date) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const MarkAsPaidDialog: React.FC<MarkAsPaidDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedFeesCount,
  paymentDate,
  setPaymentDate,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamentos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Mensalidades Selecionadas</Label>
            <p className="text-sm">
              {selectedFeesCount} mensalidades serão marcadas como pagas.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-date">Data de Pagamento</Label>
            <DatePicker
              date={paymentDate}
              setDate={(date) => date && setPaymentDate(date)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || selectedFeesCount === 0}
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar Pagamentos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsPaidDialog;
