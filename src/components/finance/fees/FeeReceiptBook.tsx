
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

interface ReceiptProps {
  userName: string;
  referenceMonth: string;
  amount: number;
  dueDate: string;
  receiptNumber: string;
}

const Receipt: React.FC<ReceiptProps> = ({ userName, referenceMonth, amount, dueDate, receiptNumber }) => {
  return (
    <div className="border border-gray-300 p-4 mb-4 page-break-inside-avoid">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold">Associação de Moradores</h3>
          <p className="text-sm text-gray-600">CNPJ: 00.000.000/0001-00</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Recibo Nº: {receiptNumber}</p>
          <p className="text-sm text-gray-600">Emitido em: {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
      </div>
      
      <div className="border-t border-b border-gray-300 py-3 my-3">
        <h4 className="font-semibold mb-2">RECIBO DE MENSALIDADE</h4>
        <p><span className="font-medium">Morador:</span> {userName}</p>
        <p><span className="font-medium">Referência:</span> {format(new Date(referenceMonth), 'MMMM yyyy', { locale: ptBR })}</p>
        <p><span className="font-medium">Valor:</span> R$ {Number(amount).toFixed(2).replace('.', ',')}</p>
        <p><span className="font-medium">Vencimento:</span> {format(new Date(dueDate), 'dd/MM/yyyy')}</p>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between">
          <div className="mt-6 border-t border-gray-300 pt-1 w-48">
            <p className="text-xs text-center">Assinatura do Responsável</p>
          </div>
          <div className="mt-6 border-t border-gray-300 pt-1 w-48">
            <p className="text-xs text-center">Assinatura do Pagante</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeeReceiptBookProps {
  fees: Array<{
    id: string;
    user_name: string;
    reference_month: string;
    amount: number;
    due_date: string;
  }>;
}

const FeeReceiptBook: React.FC<FeeReceiptBookProps> = ({ fees }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Carnê de Mensalidades',
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page-break-inside-avoid {
          page-break-inside: avoid;
        }
        .page-break {
          page-break-after: always;
        }
      }
    `
  });
  
  if (!fees.length) {
    return <p>Nenhuma mensalidade selecionada.</p>;
  }
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Carnê
        </Button>
      </div>
      
      <div ref={componentRef} className="p-4">
        <h2 className="text-xl font-bold mb-6 text-center">Carnê de Mensalidades</h2>
        
        {fees.map((fee, index) => (
          <Receipt
            key={fee.id}
            userName={fee.user_name}
            referenceMonth={fee.reference_month}
            amount={fee.amount}
            dueDate={fee.due_date}
            receiptNumber={`${format(new Date(fee.reference_month), 'yyyyMM')}-${String(index + 1).padStart(3, '0')}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeeReceiptBook;
