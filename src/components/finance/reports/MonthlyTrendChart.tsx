
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface MonthlyTrendChartProps {
  monthlyData: MonthlyDataPoint[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ monthlyData }) => {
  return (
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
  );
};

export default MonthlyTrendChart;
