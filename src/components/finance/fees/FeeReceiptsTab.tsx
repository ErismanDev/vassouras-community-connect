
import React from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import FeeReceiptBook from './FeeReceiptBook';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MonthlyFee } from './useMonthlyFees';

interface FeeReceiptsTabProps {
  monthlyFees: MonthlyFee[] | undefined;
  printMode: boolean;
  setPrintMode: (printMode: boolean) => void;
}

const FeeReceiptsTab: React.FC<FeeReceiptsTabProps> = ({
  monthlyFees,
  printMode,
  setPrintMode
}) => {
  const printableFees = monthlyFees?.map(fee => ({
    id: fee.id,
    user_name: fee.user_name || 'Desconhecido',
    reference_month: format(new Date(fee.reference_month), 'MMMM yyyy', { locale: ptBR }),
    amount: fee.amount,
    due_date: fee.due_date,
  })) || [];

  if (printMode) {
    return (
      <div className="print-only space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Carnê de Mensalidades</h2>
          <Button variant="ghost" onClick={() => setPrintMode(false)}>Voltar</Button>
        </div>
        
        <FeeReceiptBook fees={printableFees} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="text-lg font-medium">Carnês de Mensalidades</h3>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setPrintMode(true)}
        >
          <PrinterIcon className="h-4 w-4" />
          Imprimir Carnês
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-4">
        Clique em "Imprimir Carnês" para gerar uma versão para impressão dos carnês de mensalidade.
      </p>
    </div>
  );
};

export default FeeReceiptsTab;
