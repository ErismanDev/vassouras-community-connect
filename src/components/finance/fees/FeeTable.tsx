
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MonthlyFee } from './useMonthlyFees';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface FeeTableProps {
  isLoading: boolean;
  monthlyFees: MonthlyFee[] | undefined;
  selectedFees: string[];
  toggleFeeSelection: (feeId: string) => void;
  selectAllPendingFees?: () => void;
  clearSelection?: () => void;
}

const FeeTable: React.FC<FeeTableProps> = ({
  isLoading,
  monthlyFees,
  selectedFees,
  toggleFeeSelection,
  selectAllPendingFees,
  clearSelection
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Atrasado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle select all/none toggle
  const handleSelectAllToggle = () => {
    if (!monthlyFees) return;
    
    const pendingFees = monthlyFees.filter(fee => fee.status === 'pending');
    const allPendingSelected = pendingFees.every(fee => selectedFees.includes(fee.id));
    
    if (allPendingSelected) {
      clearSelection?.();
    } else {
      selectAllPendingFees?.();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando mensalidades...</span>
      </div>
    );
  }

  const pendingFees = monthlyFees?.filter(fee => fee.status === 'pending') || [];
  const allPendingSelected = pendingFees.length > 0 && pendingFees.every(fee => selectedFees.includes(fee.id));
  const somePendingSelected = pendingFees.some(fee => selectedFees.includes(fee.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox 
              checked={allPendingSelected}
              ref={(el) => {
                if (el) el.indeterminate = somePendingSelected && !allPendingSelected;
              }}
              onCheckedChange={handleSelectAllToggle}
              title="Selecionar todas as mensalidades pendentes"
            />
          </TableHead>
          <TableHead>Morador</TableHead>
          <TableHead>Mês de Referência</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pagamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!monthlyFees || monthlyFees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-10">
              Nenhuma mensalidade encontrada para os filtros selecionados.
            </TableCell>
          </TableRow>
        ) : (
          monthlyFees.map((fee) => (
            <TableRow key={fee.id} className="group">
              <TableCell>
                <Checkbox
                  checked={selectedFees.includes(fee.id)}
                  onCheckedChange={() => toggleFeeSelection(fee.id)}
                  disabled={fee.status === 'paid'}
                />
              </TableCell>
              <TableCell className="font-medium">{fee.user_name || 'Desconhecido'}</TableCell>
              <TableCell>
                {format(new Date(fee.reference_month), 'MMMM yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(fee.amount)}
              </TableCell>
              <TableCell>{format(new Date(fee.due_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{getStatusBadge(fee.status)}</TableCell>
              <TableCell>
                {fee.payment_date ? (
                  format(new Date(fee.payment_date), 'dd/MM/yyyy')
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default FeeTable;
