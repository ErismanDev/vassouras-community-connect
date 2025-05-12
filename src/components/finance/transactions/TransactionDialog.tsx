
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionFormState {
  description: string;
  amount: string;
  transaction_date: Date;
  type: 'income' | 'expense';
  category: string;
  public: boolean;
  receiptFile: File | null;
}

interface TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: TransactionFormState;
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormState>>;
  onSubmit: () => void;
  isPending: boolean;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isPending
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        receiptFile: e.target.files[0]
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value as 'income' | 'expense'})}
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Data</Label>
              <DatePicker
                date={formData.transaction_date}
                setDate={(date) => setFormData({...formData, transaction_date: date || new Date()})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transaction-description">Descrição</Label>
            <Input 
              id="transaction-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-amount">Valor (R$)</Label>
              <Input 
                id="transaction-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger id="transaction-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="utilities">Contas (Água/Luz)</SelectItem>
                  <SelectItem value="events">Eventos</SelectItem>
                  <SelectItem value="fees">Mensalidades</SelectItem>
                  <SelectItem value="projects">Projetos</SelectItem>
                  <SelectItem value="others">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transaction-receipt">Comprovante (opcional)</Label>
            <Input 
              id="transaction-receipt" 
              type="file" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="transaction-public"
              checked={formData.public}
              onChange={(e) => setFormData({...formData, public: e.target.checked})}
              className="rounded border-gray-300"
            />
            <Label htmlFor="transaction-public">
              Disponibilizar para todos os moradores
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isPending || !formData.description || !formData.amount}
          >
            {isPending ? 'Enviando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
