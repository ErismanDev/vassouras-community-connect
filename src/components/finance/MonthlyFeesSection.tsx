import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customSupabaseClient } from '@/integrations/supabase/customClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, addMonths, startOfMonth, setDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyFee {
  id: string;
  user_id: string;
  reference_month: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  payment_date?: string;
  user_name?: string;
}

interface FeeConfig {
  id: string;
  amount: number;
}

interface ResidentUser {
  id: string;
  name: string;
  email: string;
}

const MonthlyFeesSection: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // State for batch creation
  const [batchMonth, setBatchMonth] = useState<Date>(new Date());
  const [batchDueDate, setBatchDueDate] = useState<Date>(
    setDate(addMonths(new Date(), 1), 10) // Default to 10th of next month
  );
  
  // State for mark as paid
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  
  // Fetch monthly fees with user info
  const { data: monthlyFees, isLoading } = useQuery({
    queryKey: ['monthlyFees', selectedMonth, selectedStatus],
    queryFn: async () => {
      let query = customSupabaseClient.from('monthly_fees').select(`
        *,
        users:user_id (
          name,
          email
        )
      `);
      
      if (selectedMonth) {
        const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
        const endDate = format(startOfMonth(addMonths(selectedMonth, 1)), 'yyyy-MM-dd');
        query = query.gte('reference_month', startDate).lt('reference_month', endDate);
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query.order('due_date', { ascending: false });
      
      if (error) throw error;
      
      return data.map((fee: any) => ({
        ...fee,
        user_name: fee.users ? fee.users.name : 'Desconhecido'
      }));
    }
  });
  
  // Fetch fee configuration
  const { data: feeConfig } = useQuery({
    queryKey: ['feeConfig'],
    queryFn: async () => {
      const { data, error } = await customSupabaseClient
        .from('fee_configuration')
        .select('*')
        .is('end_date', null)
        .order('start_date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0] as FeeConfig;
    }
  });
  
  // Fetch residents
  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data, error } = await customSupabaseClient
        .from('users')
        .select('id, name, email')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as ResidentUser[];
    }
  });
  
  // Create monthly fee mutation
  const createFeeMutation = useMutation({
    mutationFn: async (feeData: {
      user_id: string;
      reference_month: Date;
      amount: number;
      due_date: Date;
    }) => {
      const { data, error } = await customSupabaseClient.from('monthly_fees').insert([
        {
          user_id: feeData.user_id,
          reference_month: format(startOfMonth(feeData.reference_month), 'yyyy-MM-dd'),
          amount: feeData.amount,
          due_date: format(feeData.due_date, 'yyyy-MM-dd')
        }
      ]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      setIsCreateDialogOpen(false);
      toast.success('Mensalidade registrada com sucesso!');
    }
  });
  
  // Create batch monthly fees mutation
  const createBatchFeesMutation = useMutation({
    mutationFn: async (data: { month: Date; dueDate: Date }) => {
      if (!feeConfig || !residents) {
        throw new Error('Configuração de mensalidade ou lista de moradores não disponível');
      }
      
      const feesToCreate = residents.map(resident => ({
        user_id: resident.id,
        reference_month: format(startOfMonth(data.month), 'yyyy-MM-dd'),
        amount: feeConfig.amount,
        due_date: format(data.dueDate, 'yyyy-MM-dd')
      }));
      
      const { data: responseData, error } = await customSupabaseClient
        .from('monthly_fees')
        .insert(feesToCreate);
      
      if (error) throw error;
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      setIsBatchDialogOpen(false);
      toast.success('Mensalidades geradas com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating batch fees:', error);
      toast.error('Erro ao gerar mensalidades. Verifique se algumas já existem para o mês selecionado.');
    }
  });
  
  // Mark fees as paid mutation
  const markFeesAsPaidMutation = useMutation({
    mutationFn: async (data: { feeIds: string[]; paymentDate: Date }) => {
      const { data: responseData, error } = await customSupabaseClient
        .from('monthly_fees')
        .update({
          status: 'paid',
          payment_date: format(data.paymentDate, 'yyyy-MM-dd')
        })
        .in('id', data.feeIds);
      
      if (error) throw error;
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      setIsMarkPaidDialogOpen(false);
      setSelectedFees([]);
      toast.success('Pagamentos registrados com sucesso!');
    }
  });
  
  // Get total values
  const totalFees = monthlyFees?.length || 0;
  const paidFees = monthlyFees?.filter(fee => fee.status === 'paid').length || 0;
  const pendingFees = monthlyFees?.filter(fee => fee.status === 'pending').length || 0;
  const overdueFees = monthlyFees?.filter(fee => fee.status === 'overdue').length || 0;
  
  const totalAmount = monthlyFees?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
  const collectedAmount = monthlyFees?.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
  const pendingAmount = monthlyFees?.filter(fee => fee.status !== 'paid').reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
  
  // Handle selecting/deselecting fees
  const toggleFeeSelection = (feeId: string) => {
    if (selectedFees.includes(feeId)) {
      setSelectedFees(selectedFees.filter(id => id !== feeId));
    } else {
      setSelectedFees([...selectedFees, feeId]);
    }
  };
  
  const selectAllPendingFees = () => {
    if (!monthlyFees) return;
    
    const pendingFeeIds = monthlyFees
      .filter(fee => fee.status === 'pending')
      .map(fee => fee.id);
      
    setSelectedFees(pendingFeeIds);
  };
  
  const clearSelection = () => {
    setSelectedFees([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de Mensalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFees}</p>
            <p className="text-sm text-muted-foreground">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{paidFees}</p>
            <p className="text-sm text-muted-foreground">R$ {collectedAmount.toFixed(2).replace('.', ',')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{pendingFees}</p>
            <p className="text-sm text-muted-foreground">Valor a receber</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{overdueFees}</p>
            <p className="text-sm text-muted-foreground">Necessitam atenção</p>
          </CardContent>
        </Card>
      </div>
      
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
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="overdue">Atrasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => {
            setSelectedMonth(undefined);
            setSelectedStatus('');
          }} className="mt-6">
            Limpar Filtros
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsBatchDialogOpen(true)}>
            Gerar Mensalidades em Lote
          </Button>
        </div>
      </div>
      
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
      
      {selectedFees.length > 0 && (
        <div className="flex justify-between items-center bg-muted p-4 rounded-md">
          <div>
            <p className="font-medium">{selectedFees.length} mensalidades selecionadas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSelection}>
              Limpar Seleção
            </Button>
            <Button onClick={() => setIsMarkPaidDialogOpen(true)}>
              Registrar Pagamentos
            </Button>
          </div>
        </div>
      )}
      
      {/* Batch Generate Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
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
                Serão geradas {residents?.length || 0} mensalidades.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={() => createBatchFeesMutation.mutate({ month: batchMonth, dueDate: batchDueDate })}
              disabled={createBatchFeesMutation.isPending || !residents || residents.length === 0 || !feeConfig}
            >
              {createBatchFeesMutation.isPending ? 'Gerando...' : 'Gerar Mensalidades'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mark as Paid Dialog */}
      <Dialog open={isMarkPaidDialogOpen} onOpenChange={setIsMarkPaidDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mensalidades Selecionadas</Label>
              <p className="text-sm">
                {selectedFees.length} mensalidades serão marcadas como pagas.
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
            <Button type="button" variant="outline" onClick={() => setIsMarkPaidDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={() => markFeesAsPaidMutation.mutate({ feeIds: selectedFees, paymentDate })}
              disabled={markFeesAsPaidMutation.isPending || selectedFees.length === 0}
            >
              {markFeesAsPaidMutation.isPending ? 'Registrando...' : 'Confirmar Pagamentos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyFeesSection;
