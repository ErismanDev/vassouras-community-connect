
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface IndividualFeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const IndividualFeeForm: React.FC<IndividualFeeFormProps> = ({
  isOpen,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [referenceMonth, setReferenceMonth] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>('');

  // Fetch users for selection
  const { data: users } = useQuery({
    queryKey: ['users-for-fees'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        return data.users.map(user => ({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || ''
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: isOpen
  });

  // Get current fee configuration
  const { data: feeConfig } = useQuery({
    queryKey: ['feeConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_configuration')
        .select('*')
        .is('end_date', null)
        .order('start_date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0];
    }
  });

  // Create individual fee mutation
  const createIndividualFeeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !amount) {
        throw new Error('Usuário e valor são obrigatórios');
      }

      const { data, error } = await supabase
        .from('monthly_fees')
        .insert([{
          user_id: selectedUserId,
          amount: parseFloat(amount),
          reference_month: format(referenceMonth, 'yyyy-MM-dd'),
          due_date: format(dueDate, 'yyyy-MM-dd'),
          status: 'pending'
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyFees'] });
      onOpenChange(false);
      toast.success('Mensalidade individual criada com sucesso!');
      // Reset form
      setSelectedUserId('');
      setAmount('');
      setReferenceMonth(new Date());
      setDueDate(new Date());
      setDescription('');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar mensalidade: ${error.message}`);
    }
  });

  // Set default amount when fee config loads
  React.useEffect(() => {
    if (feeConfig && !amount) {
      setAmount(feeConfig.amount.toString());
    }
  }, [feeConfig, amount]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Mensalidade Individual</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Morador</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um morador" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês de Referência</Label>
              <DatePicker
                date={referenceMonth}
                setDate={(date) => date && setReferenceMonth(date)}
                showMonthYearPicker={true}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <DatePicker
                date={dueDate}
                setDate={(date) => date && setDueDate(date)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {feeConfig && (
              <p className="text-sm text-muted-foreground">
                Valor padrão: R$ {Number(feeConfig.amount).toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Descrição da mensalidade"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={() => createIndividualFeeMutation.mutate()}
            disabled={createIndividualFeeMutation.isPending || !selectedUserId || !amount}
          >
            {createIndividualFeeMutation.isPending ? 'Criando...' : 'Criar Mensalidade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualFeeForm;
