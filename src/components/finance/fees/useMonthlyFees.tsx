
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, addMonths } from 'date-fns'; // Add missing imports
import { useBatchFeeGeneration } from './useBatchFeeGeneration';

export interface MonthlyFee {
  id: string;
  user_id: string;
  reference_month: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  payment_date?: string;
  user_name?: string;
}

export const useMonthlyFees = () => {
  const queryClient = useQueryClient();
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  
  // Integrate batch fee generation
  const batchFeeGeneration = useBatchFeeGeneration();
  
  // Fetch monthly fees with user info
  const { data: monthlyFees, isLoading } = useQuery({
    queryKey: ['monthlyFees', selectedMonth, selectedStatus],
    queryFn: async () => {
      let query = supabase.from('monthly_fees').select(`
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
      
      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query.order('due_date', { ascending: false });
      
      if (error) throw error;
      
      return data.map((fee: any) => ({
        ...fee,
        user_name: fee.users ? fee.users.name : 'Desconhecido'
      })) as MonthlyFee[];
    }
  });
  
  // Fetch fee configuration
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
  
  // Fetch residents
  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Mark fees as paid mutation
  const markFeesAsPaidMutation = useMutation({
    mutationFn: async (data: { feeIds: string[]; paymentDate: Date }) => {
      const { data: responseData, error } = await supabase
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
  
  const resetFilters = () => {
    setSelectedMonth(undefined);
    setSelectedStatus('all');
  };

  return {
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
    ...batchFeeGeneration
  };
};
