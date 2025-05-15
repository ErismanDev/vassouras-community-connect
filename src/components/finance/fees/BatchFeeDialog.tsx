
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';

interface BatchFeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  batchMonth: Date;
  setBatchMonth: (date: Date) => void;
  batchDueDate: Date;
  setBatchDueDate: (date: Date) => void;
  feeConfig: any;
  residentsCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const BatchFeeDialog: React.FC<BatchFeeDialogProps> = ({
  isOpen,
  onOpenChange,
  batchMonth,
  setBatchMonth,
  batchDueDate,
  setBatchDueDate,
  feeConfig,
  residentsCount,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Mensalidades em Lote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-month">Mês de Referência</Label>
              <DatePicker
                date={batchMonth}
                setDate={(date) => date && setBatchMonth(date)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-due-date">Data de Vencimento</Label>
              <DatePicker
                date={batchDueDate}
                setDate={(date) => date && setBatchDueDate(date)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Valor da Mensalidade</Label>
            <Input 
              value={feeConfig ? `R$ ${Number(feeConfig.amount).toFixed(2).replace('.', ',')}` : 'Carregando...'}
              disabled
            />
            <p className="text-sm text-muted-foreground">
              O valor padrão é definido na seção de configuração.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Moradores</Label>
            <p className="text-sm">
              Serão geradas até {residentsCount} mensalidades, para residentes que ainda não possuem mensalidade para o mês selecionado.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !residentsCount || !feeConfig}
          >
            {isSubmitting ? 'Gerando...' : 'Gerar Mensalidades'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchFeeDialog;
