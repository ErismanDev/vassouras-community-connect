import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Função para lidar com a seleção de datas de forma segura
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    // Fechamos o popover após a seleção para evitar problemas de referência
    setTimeout(() => {
      setOpen(false);
    }, 0);
  };

  // Referência para verificar se o componente ainda está montado antes de atualizar o estado
  const isMounted = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      // Só atualizamos o estado se o componente ainda estiver montado
      if (isMounted.current) {
        setOpen(isOpen);
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
