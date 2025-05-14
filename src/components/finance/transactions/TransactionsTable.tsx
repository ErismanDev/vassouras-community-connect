
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';

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

interface TransactionsTableProps {
  transactions: TransactionProps[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, isLoading, isAdmin }) => {
  return (
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
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                      <span>Carregando transações...</span>
                    </div>
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
                      {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
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
  );
};

export default TransactionsTable;
