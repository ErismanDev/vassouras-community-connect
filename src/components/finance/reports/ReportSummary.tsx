
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ReportSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ totalIncome, totalExpense, balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Total de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalIncome.toFixed(2).replace('.', ',')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Total de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Saldo do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {balance.toFixed(2).replace('.', ',')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSummary;
