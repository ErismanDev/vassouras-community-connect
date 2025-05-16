
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
  feeConfig?: any; // Add the feeConfig prop that's being passed
}

const CurrentFeeCard: React.FC<CurrentFeeCardProps> = ({ 
  currentFeeConfig, 
  onOpenDialog,
  feeConfig // Either use this directly or map it to currentFeeConfig
}) => {
  // If feeConfig is passed instead of currentFeeConfig, use that
  const configToUse = currentFeeConfig || feeConfig;
  
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
                R$ {configToUse ? Number(configToUse.amount).toFixed(2).replace('.', ',') : '0,00'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Vigente desde</h3>
              <p className="text-lg">
                {configToUse ? format(new Date(configToUse.start_date), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Descrição</h3>
              <p className="text-lg">
                {configToUse ? configToUse.description : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentFeeCard;
