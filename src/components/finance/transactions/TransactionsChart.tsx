
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataItem {
  month: string;
  income: number;
  expense: number;
}

interface TransactionsChartProps {
  chartData: ChartDataItem[];
}

const TransactionsChart: React.FC<TransactionsChartProps> = ({ chartData }) => {
  return (
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
  );
};

export default TransactionsChart;
