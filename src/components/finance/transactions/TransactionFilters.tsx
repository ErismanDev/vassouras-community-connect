
import React from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Download } from 'lucide-react';

interface FiltersState {
  startDate?: Date;
  endDate?: Date;
  type: string;
  category: string;
}

interface TransactionFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  categories: string[];
  onExport: () => void;
  onReset: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  setFilters,
  categories,
  onExport,
  onReset
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={() => setFilters({...filters})}>
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <div className="flex gap-2">
          <DatePicker
            date={filters.startDate}
            setDate={(date) => setFilters({...filters, startDate: date})}
          />
          <DatePicker
            date={filters.endDate}
            setDate={(date) => setFilters({...filters, endDate: date})}
          />
        </div>
        <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onReset}>Limpar</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
