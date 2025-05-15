
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMonthlyFees, MonthlyFee } from './fees/useMonthlyFees';
import FeeReceiptBook from './fees/FeeReceiptBook';
import BatchFeeDialog from './fees/BatchFeeDialog';
import MarkAsPaidDialog from './fees/MarkAsPaidDialog';
import FeeDashboard from './fees/FeeDashboard';
import { toast } from 'sonner'; // Add this import

const MonthlyFeesSection: React.FC = () => {
  const {
    monthlyFees,
    isLoading,
    totalFees,
    paidFees,
    pendingFees,
    overdueFees,
    totalAmount,
    collectedAmount,
    pendingAmount,
    selectedMonth,
    setSelectedMonth,
    selectedStatus,
    setSelectedStatus,
    selectedFees,
    setSelectedFees,
    paymentDate,
    setPaymentDate,
    isMarkPaidDialogOpen,
    setIsMarkPaidDialogOpen,
    feeConfig,
    residents,
    markFeesAsPaidMutation,
    toggleFeeSelection,
    selectAllPendingFees,
    clearSelection,
    resetFilters,
    
    // Batch fee generation
    isBatchDialogOpen,
    setIsBatchDialogOpen,
    batchMonth,
    setBatchMonth,
    batchDueDate,
    setBatchDueDate,
    batchFeeMutation
  } = useMonthlyFees();
  
  // State for showing receipt book
  const [showReceiptBook, setShowReceiptBook] = useState(false);
  const [printableFees, setPrintableFees] = useState<MonthlyFee[]>([]);
  
  // Handle generating receipt book
  const handleGenerateReceiptBook = () => {
    if (!monthlyFees) return;
    
    // Use selected fees or all pending fees
    const feesToPrint = selectedFees.length > 0
      ? monthlyFees.filter(fee => selectedFees.includes(fee.id))
      : monthlyFees.filter(fee => fee.status === 'pending');
    
    if (feesToPrint.length === 0) {
      toast.error('Selecione ao menos uma mensalidade para gerar o carnê.');
      return;
    }
    
    setPrintableFees(feesToPrint);
    setShowReceiptBook(true);
  };
  
  // Handle marking selected fees as paid
  const handleMarkAsPaid = () => {
    if (selectedFees.length > 0) {
      markFeesAsPaidMutation.mutate({
        feeIds: selectedFees,
        paymentDate
      });
    }
  };

  return showReceiptBook ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowReceiptBook(false)}>
          Voltar para Mensalidades
        </Button>
        <h2 className="text-xl font-bold">Carnê de Mensalidades</h2>
      </div>
      
      <FeeReceiptBook fees={printableFees as unknown as { id: string; user_name: string; reference_month: string; amount: number; due_date: string; }[]} />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <FeeDashboard 
        totalFees={totalFees}
        totalAmount={totalAmount}
        paidFees={paidFees}
        collectedAmount={collectedAmount}
        pendingFees={pendingFees}
        overdueFees={overdueFees}
      />
      
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="w-40">
            <Label className="mb-1 block">Mês de Referência</Label>
            <DatePicker
              date={selectedMonth}
              setDate={setSelectedMonth}
            />
          </div>
          <div className="w-36">
            <Label className="mb-1 block">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="overdue">Atrasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={resetFilters} className="mt-6">
            Limpar Filtros
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsBatchDialogOpen(true)}>
            Gerar Mensalidades em Lote
          </Button>
        </div>
      </div>
      
      {/* Fees Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedFees.length > 0 && selectedFees.length === monthlyFees?.filter(f => f.status === 'pending').length}
                      onChange={() => {
                        if (selectedFees.length > 0) {
                          clearSelection();
                        } else {
                          selectAllPendingFees();
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Morador</TableHead>
                  <TableHead>Mês Ref.</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Carregando mensalidades...
                    </TableCell>
                  </TableRow>
                ) : !monthlyFees || monthlyFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Nenhuma mensalidade encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlyFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        {fee.status === 'pending' && (
                          <input 
                            type="checkbox" 
                            checked={selectedFees.includes(fee.id)}
                            onChange={() => toggleFeeSelection(fee.id)}
                            className="rounded border-gray-300"
                          />
                        )}
                      </TableCell>
                      <TableCell>{fee.user_name}</TableCell>
                      <TableCell>
                        {format(new Date(fee.reference_month), 'MMM yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        R$ {Number(fee.amount).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(fee.due_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {fee.payment_date ? format(new Date(fee.payment_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            fee.status === 'paid' ? 'default' : 
                            fee.status === 'pending' ? 'outline' : 
                            'destructive'
                          }
                        >
                          {fee.status === 'paid' ? 'Paga' : 
                           fee.status === 'pending' ? 'Pendente' : 
                           'Atrasada'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Fees Actions */}
      {selectedFees.length > 0 && (
        <div className="flex justify-between items-center bg-muted p-4 rounded-md">
          <div>
            <p className="font-medium">{selectedFees.length} mensalidades selecionadas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSelection}>
              Limpar Seleção
            </Button>
            <Button variant="outline" onClick={handleGenerateReceiptBook}>
              Gerar Carnê
            </Button>
            <Button onClick={() => setIsMarkPaidDialogOpen(true)}>
              Registrar Pagamentos
            </Button>
          </div>
        </div>
      )}
      
      {/* Batch Generate Dialog */}
      <BatchFeeDialog 
        isOpen={isBatchDialogOpen}
        onOpenChange={setIsBatchDialogOpen}
        batchMonth={batchMonth}
        setBatchMonth={setBatchMonth}
        batchDueDate={batchDueDate}
        setBatchDueDate={setBatchDueDate}
        feeConfig={feeConfig}
        residentsCount={residents?.length || 0}
        onSubmit={() => batchFeeMutation.mutate()}
        isSubmitting={batchFeeMutation.isPending}
      />
      
      {/* Mark as Paid Dialog */}
      <MarkAsPaidDialog 
        isOpen={isMarkPaidDialogOpen}
        onOpenChange={setIsMarkPaidDialogOpen}
        selectedFeesCount={selectedFees.length}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        onSubmit={handleMarkAsPaid}
        isSubmitting={markFeesAsPaidMutation.isPending}
      />
    </div>
  );
};

export default MonthlyFeesSection;
