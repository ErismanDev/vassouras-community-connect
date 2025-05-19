
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Switch } from '@/components/ui/switch';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  onGenerate?: (options: { generateAllMonths: boolean, amount?: number }) => void;
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
  isSubmitting,
  onGenerate
}) => {
  // State for custom amount and generating all 12 months
  const [customAmount, setCustomAmount] = useState<string>('');
  const [generateAllMonths, setGenerateAllMonths] = useState(false);
  
  // Reset states when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCustomAmount('');
      setGenerateAllMonths(false);
    }
  }, [isOpen]);
  
  // Get default amount from fee configuration
  const defaultAmount = feeConfig ? Number(feeConfig.amount) : 0;
  
  // Calculate final amount to use
  const finalAmount = customAmount ? parseFloat(customAmount) : defaultAmount;
  
  // Handle the generate action
  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({ 
        generateAllMonths,
        amount: customAmount ? parseFloat(customAmount) : undefined
      });
    } else {
      onSubmit();
    }
  };

  // Preview months that will be generated if all 12 months is selected
  const previewMonths = React.useMemo(() => {
    if (!generateAllMonths) return [];
    
    const months = [];
    for (let i = 0; i < 12; i++) {
      const currentMonth = addMonths(batchMonth, i);
      months.push(format(currentMonth, 'MMMM/yyyy', { locale: ptBR }));
    }
    return months;
  }, [generateAllMonths, batchMonth]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Mensalidades em Lote</DialogTitle>
          <DialogDescription>
            Configure as informações para geração de mensalidades para todos os moradores ativos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-month">Mês de Referência</Label>
              <DatePicker
                date={batchMonth}
                setDate={(date) => date && setBatchMonth(date)}
                showMonthYearPicker={true}
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
            <div className="flex space-x-2">
              <Input 
                placeholder={`R$ ${defaultAmount.toFixed(2).replace('.', ',')}`}
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,.]/g, '');
                  setCustomAmount(value);
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {customAmount 
                ? 'Valor personalizado será aplicado a todas as mensalidades geradas.' 
                : 'O valor padrão é definido na seção de configuração.'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={generateAllMonths} 
              onCheckedChange={setGenerateAllMonths}
              id="generate-all-months"
            />
            <Label htmlFor="generate-all-months" className="cursor-pointer">
              Gerar carnê anual (12 meses consecutivos)
            </Label>
          </div>
          
          {generateAllMonths && (
            <div className="space-y-2 border rounded-md p-3 bg-muted/30">
              <Label>Prévia dos meses que serão gerados:</Label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {previewMonths.map((month, idx) => (
                  <div key={idx} className="bg-muted rounded p-1 text-center">
                    {month}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Moradores</Label>
            <p className="text-sm">
              Serão geradas mensalidades para {residentsCount} moradores ativos.
              {generateAllMonths 
                ? ` Total potencial de até ${residentsCount * 12} mensalidades.`
                : ''
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Nota: Mensalidades existentes para os meses selecionados não serão duplicadas.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={handleGenerate}
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
