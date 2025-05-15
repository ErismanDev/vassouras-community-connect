
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FeeDashboardProps {
  totalFees: number;
  totalAmount: number;
  paidFees: number;
  collectedAmount: number;
  pendingFees: number;
  overdueFees: number;
}

const FeeDashboard: React.FC<FeeDashboardProps> = ({
  totalFees,
  totalAmount,
  paidFees,
  collectedAmount,
  pendingFees,
  overdueFees
}) => {
  return (
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
  );
};

export default FeeDashboard;
