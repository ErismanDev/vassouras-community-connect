
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CurrentFeeCardProps {
  currentFeeConfig: {
    amount: number;
    start_date: string;
    description: string;
  } | null;
  onOpenDialog: () => void;
}

const CurrentFeeCard: React.FC<CurrentFeeCardProps> = ({ currentFeeConfig, onOpenDialog }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Valor Atual da Mensalidade</CardTitle>
          <Button onClick={onOpenDialog}>
            Alterar Valor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-medium">Valor</h3>
              <p className="text-3xl font-bold">
                R$ {currentFeeConfig ? Number(currentFeeConfig.amount).toFixed(2).replace('.', ',') : '0,00'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Vigente desde</h3>
              <p className="text-lg">
                {currentFeeConfig ? format(new Date(currentFeeConfig.start_date), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Descrição</h3>
              <p className="text-lg">
                {currentFeeConfig ? currentFeeConfig.description : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentFeeCard;
