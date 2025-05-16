
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FeeFiltersProps {
  selectedMonth: Date | undefined;
  setSelectedMonth: (date: Date | undefined) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  resetFilters: () => void;
}

const FeeFilters: React.FC<FeeFiltersProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedStatus,
  setSelectedStatus,
  resetFilters
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <Label htmlFor="month-filter">Filtrar por Mês</Label>
            <DatePicker
              date={selectedMonth}
              setDate={setSelectedMonth}
              placeholder="Selecione um mês"
              showMonthYearPicker
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <Label htmlFor="status-filter">Filtrar por Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={resetFilters}
          >
            <X className="h-4 w-4" /> Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeFilters;
