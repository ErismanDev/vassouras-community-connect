
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionProps {
  amount: number;
  transaction_date: string;
  type: 'income' | 'expense';
  category: string;
}

interface FinancialReportsSectionProps {
  isAdmin: boolean;
}

const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
const INCOME_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

const FinancialReportsSection: React.FC<FinancialReportsSectionProps> = ({ isAdmin }) => {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 5)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  
  // Fetch transactions for reporting
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactionsReport', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data as TransactionProps[];
    }
  });
  
  // Monthly trend data
  const monthlyData = React.useMemo(() => {
    if (!transactions) return [];
    
    const monthlyMap: Record<string, { month: string, income: number, expense: number, balance: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthYear = format(date, 'yyyy-MM');
      const monthDisplay = format(date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthDisplay, income: 0, expense: 0, balance: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyMap[monthYear].income += Number(transaction.amount);
      } else {
        monthlyMap[monthYear].expense += Number(transaction.amount);
      }
      
      monthlyMap[monthYear].balance = monthlyMap[monthYear].income - monthlyMap[monthYear].expense;
    });
    
    return Object.values(monthlyMap).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ').reverse();
      const [monthB, yearB] = b.month.split(' ').reverse();
      return new Date(`${monthA} ${yearA}`).getTime() - new Date(`${monthB} ${yearB}`).getTime();
    });
  }, [transactions]);
  
  // Expense breakdown by category
  const expensesByCategory = React.useMemo(() => {
    if (!transactions) return [];
    
    const categoryMap: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        
        categoryMap[transaction.category] += Number(transaction.amount);
      });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  // Income breakdown by category
  const incomeByCategory = React.useMemo(() => {
    if (!transactions) return [];
    
    const categoryMap: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        
        categoryMap[transaction.category] += Number(transaction.amount);
      });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  // Summary data
  const summaryData = React.useMemo(() => {
    if (!transactions) {
      return { totalIncome: 0, totalExpense: 0, balance: 0 };
    }
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);
  
  const handleExportPDF = () => {
    // In a real application, this would generate a PDF report
    alert('Esta funcionalidade geraria um relatório em PDF');
  };
  
  const handleExportExcel = () => {
    // For simplicity, we'll just export a CSV which can be opened in Excel
    if (!transactions || !transactions.length) return;
    
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'];
    const csvData = transactions.map(t => [
      format(new Date(t.transaction_date), 'dd/MM/yyyy'),
      '', // Description not included in our simplified data model
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
    link.setAttribute('download', `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <DatePicker
              date={startDate}
              setDate={(date) => date && setStartDate(date)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data Final</Label>
            <DatePicker
              date={endDate}
              setDate={(date) => date && setEndDate(date)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {summaryData.totalIncome.toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {summaryData.totalExpense.toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Saldo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summaryData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {summaryData.balance.toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>
            Receitas, despesas e saldo por mês
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer config={{
            income: { color: '#22c55e' },
            expense: { color: '#ef4444' },
            balance: { color: '#3b82f6' },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" name="Receitas" stroke="var(--color-income)" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line type="monotone" dataKey="expense" name="Despesas" stroke="var(--color-expense)" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line type="monotone" dataKey="balance" name="Saldo" stroke="var(--color-balance)" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição de gastos no período
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
            <CardDescription>
              Fontes de receita no período
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReportsSection;
