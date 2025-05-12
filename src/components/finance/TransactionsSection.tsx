
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface TransactionProps {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  type: 'income' | 'expense';
  category: string;
  created_at: string;
  receipt_url?: string;
  public: boolean;
}

interface TransactionsSectionProps {
  isAdmin: boolean;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ isAdmin }) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    type: '',
    category: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    transaction_date: new Date(),
    type: 'income',
    category: 'general',
    public: true,
    receiptFile: null as File | null
  });
  
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase.from('financial_transactions').select('*');
      
      if (filters.startDate) {
        query = query.gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query.order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data as TransactionProps[];
    }
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: typeof newTransaction) => {
      // Upload receipt if provided
      let receiptUrl = null;
      if (transaction.receiptFile) {
        const fileName = `${Date.now()}-${transaction.receiptFile.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('financial_receipts')
          .upload(fileName, transaction.receiptFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('financial_receipts')
          .getPublicUrl(fileName);
          
        receiptUrl = publicUrl;
      }
      
      // Create transaction record
      const { data, error } = await supabase.from('financial_transactions').insert([
        {
          description: transaction.description,
          amount: parseFloat(transaction.amount),
          transaction_date: format(transaction.transaction_date, 'yyyy-MM-dd'),
          type: transaction.type,
          category: transaction.category,
          receipt_url: receiptUrl,
          public: transaction.public
        }
      ]).select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsDialogOpen(false);
      setNewTransaction({
        description: '',
        amount: '',
        transaction_date: new Date(),
        type: 'income',
        category: 'general',
        public: true,
        receiptFile: null
      });
      toast.success('Transação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao registrar transação. Tente novamente.');
    }
  });

  // Handle chart data
  const chartData = React.useMemo(() => {
    if (!transactions) return [];
    
    const monthlyData: Record<string, { month: string, income: number, expense: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthYear = format(date, 'yyyy-MM');
      const monthDisplay = format(date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthDisplay, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthYear].income += Number(transaction.amount);
      } else {
        monthlyData[monthYear].expense += Number(transaction.amount);
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const [yearA, monthA] = a.month.split(' ');
      const [yearB, monthB] = b.month.split(' ');
      return new Date(`${monthA} ${yearA}`).getTime() - new Date(`${monthB} ${yearB}`).getTime();
    }).slice(-6); // Last 6 months
  }, [transactions]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTransaction({
        ...newTransaction,
        receiptFile: e.target.files[0]
      });
    }
  };

  const handleExportCSV = () => {
    if (!transactions || !transactions.length) return;
    
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'];
    const csvData = transactions.map(t => [
      format(new Date(t.transaction_date), 'dd/MM/yyyy'),
      t.description,
      t.amount.toString().replace('.', ','),
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      type: '',
      category: ''
    });
  };

  // Get available categories
  const categories = React.useMemo(() => {
    if (!transactions) return [];
    const categorySet = new Set<string>();
    transactions.forEach(t => categorySet.add(t.category));
    return Array.from(categorySet);
  }, [transactions]);
  
  const totalIncome = React.useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);
  
  const totalExpense = React.useMemo(() => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(totalIncome - totalExpense).toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalExpense.toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Últimos 6 meses de movimentação</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer config={{
            income: { color: '#22c55e' },
            expense: { color: '#ef4444' },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="income" name="Receitas" fill="var(--color-income)" />
                <Bar dataKey="expense" name="Despesas" fill="var(--color-expense)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setFilters({...filters})}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <div className="flex gap-2">
            <DatePicker
              date={filters.startDate}
              setDate={(date) => setFilters({...filters, startDate: date})}
            />
            <DatePicker
              date={filters.endDate}
              setDate={(date) => setFilters({...filters, endDate: date})}
            />
          </div>
          <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={resetFilters}>Limpar</Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  {isAdmin && <TableHead>Comprovante</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-10">
                      Carregando transações...
                    </TableCell>
                  </TableRow>
                ) : !transactions || transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-10">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {Number(transaction.amount).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {transaction.receipt_url ? (
                            <a 
                              href={transaction.receipt_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-500 hover:underline"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Ver
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction-type">Tipo</Label>
                  <Select 
                    value={newTransaction.type} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, type: value as 'income' | 'expense'})}
                  >
                    <SelectTrigger id="transaction-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-date">Data</Label>
                  <DatePicker
                    date={newTransaction.transaction_date}
                    setDate={(date) => setNewTransaction({...newTransaction, transaction_date: date || new Date()})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transaction-description">Descrição</Label>
                <Input 
                  id="transaction-description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction-amount">Valor (R$)</Label>
                  <Input 
                    id="transaction-amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-category">Categoria</Label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger id="transaction-category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="utilities">Contas (Água/Luz)</SelectItem>
                      <SelectItem value="events">Eventos</SelectItem>
                      <SelectItem value="fees">Mensalidades</SelectItem>
                      <SelectItem value="projects">Projetos</SelectItem>
                      <SelectItem value="others">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transaction-receipt">Comprovante (opcional)</Label>
                <Input 
                  id="transaction-receipt" 
                  type="file" 
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="transaction-public"
                  checked={newTransaction.public}
                  onChange={(e) => setNewTransaction({...newTransaction, public: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="transaction-public">
                  Disponibilizar para todos os moradores
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={() => createTransactionMutation.mutate(newTransaction)}
                disabled={createTransactionMutation.isPending || !newTransaction.description || !newTransaction.amount}
              >
                {createTransactionMutation.isPending ? 'Enviando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionsSection;
