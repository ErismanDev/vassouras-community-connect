
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customSupabaseClient } from '@/integrations/supabase/customClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/datepicker';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FeeConfig {
  id: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  description: string;
  created_at: string;
  created_by: string;
}

const FeeConfigurationSection: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeeConfig, setNewFeeConfig] = useState({
    amount: '',
    start_date: new Date(),
    description: ''
  });
  
  // Fetch fee configurations
  const { data: feeConfigs, isLoading } = useQuery({
    queryKey: ['feeConfigs'],
    queryFn: async () => {
      const { data, error } = await customSupabaseClient
        .from('fee_configuration')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as FeeConfig[];
    }
  });
  
  // Create fee configuration mutation
  const createFeeConfigMutation = useMutation({
    mutationFn: async (feeConfig: typeof newFeeConfig) => {
      // If there's an active fee config, update its end_date
      const { data: activeConfig } = await customSupabaseClient
        .from('fee_configuration')
        .select('id')
        .is('end_date', null)
        .single();
      
      if (activeConfig) {
        await customSupabaseClient
          .from('fee_configuration')
          .update({ end_date: format(new Date(feeConfig.start_date), 'yyyy-MM-dd') })
          .eq('id', activeConfig.id);
      }
      
      // Create new fee configuration
      const { data, error } = await customSupabaseClient
        .from('fee_configuration')
        .insert([
          {
            amount: parseFloat(feeConfig.amount),
            start_date: format(feeConfig.start_date, 'yyyy-MM-dd'),
            description: feeConfig.description
          }
        ]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeConfigs'] });
      setIsDialogOpen(false);
      setNewFeeConfig({
        amount: '',
        start_date: new Date(),
        description: ''
      });
      toast.success('Valor de mensalidade atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating fee config:', error);
      toast.error('Erro ao atualizar valor da mensalidade');
    }
  });
  
  // Get current fee configuration
  const currentFeeConfig = feeConfigs?.find(config => config.end_date === null);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Valor Atual da Mensalidade</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
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
      
      {/* Create Fee Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Definir Novo Valor de Mensalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fee-amount">Valor da Mensalidade (R$)</Label>
              <Input
                id="fee-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newFeeConfig.amount}
                onChange={(e) => setNewFeeConfig({...newFeeConfig, amount: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fee-start-date">Data de Início</Label>
              <DatePicker
                date={newFeeConfig.start_date}
                setDate={(date) => date && setNewFeeConfig({...newFeeConfig, start_date: date})}
              />
              <p className="text-sm text-muted-foreground">
                A partir desta data, o valor atual será substituído pelo novo valor.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fee-description">Descrição/Motivo</Label>
              <Input
                id="fee-description"
                placeholder="Ex: Ajuste anual"
                value={newFeeConfig.description}
                onChange={(e) => setNewFeeConfig({...newFeeConfig, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={() => createFeeConfigMutation.mutate(newFeeConfig)}
              disabled={createFeeConfigMutation.isPending || !newFeeConfig.amount || !newFeeConfig.description}
            >
              {createFeeConfigMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeConfigurationSection;
