
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface FeeConfig {
  id: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  description: string;
  created_at: string;
  created_by: string;
}

interface FeeHistoryTableProps {
  feeConfigs: FeeConfig[] | undefined;
  isLoading: boolean;
}

const FeeHistoryTable: React.FC<FeeHistoryTableProps> = ({ feeConfigs, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Valores</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valor</TableHead>
                <TableHead>Início da Vigência</TableHead>
                <TableHead>Fim da Vigência</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    Carregando configurações...
                  </TableCell>
                </TableRow>
              ) : !feeConfigs || feeConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    Nenhuma configuração encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                feeConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">
                      R$ {Number(config.amount).toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(config.start_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {config.end_date ? format(new Date(config.end_date), 'dd/MM/yyyy') : 'Vigente'}
                    </TableCell>
                    <TableCell>{config.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeHistoryTable;
