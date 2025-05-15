import React, { useEffect, useState } from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown, Loader2, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface UserSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  onUserDataChange?: (userData: { name: string; email: string }) => void;
}

export default function UserSearchSelect({
  value,
  onChange,
  onUserDataChange
}: UserSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('id, email');
        
        if (error) {
          console.error('Erro ao buscar usuários:', error);
          return;
        }
        
        // Ensure we always have an array to avoid issues later
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
        
        // If we have a value (user ID) already selected, find and display their name
        if (value) {
          const selectedUser = usersArray.find(user => user.id === value);
          if (selectedUser) {
            setSelectedUserName(selectedUser.email.split('@')[0] || 'Usuário');
            onUserDataChange?.({
              name: selectedUser.email.split('@')[0] || 'Usuário',
              email: selectedUser.email
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [value, onUserDataChange]);

  // Make sure we have a display value, fallback if not
  const displayValue = selectedUserName || (value ? "Usuário selecionado" : "Selecione um usuário");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading ? "Carregando..." : displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar usuário..." />
          <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
          <CommandGroup>
            {Array.isArray(users) && users.map((user) => (
              <CommandItem
                key={user.id}
                value={user.id}
                onSelect={() => {
                  const newValue = user.id === value ? '' : user.id;
                  onChange(newValue);
                  
                  if (newValue) {
                    setSelectedUserName(user.email.split('@')[0] || 'Usuário');
                    onUserDataChange?.({
                      name: user.email.split('@')[0] || 'Usuário',
                      email: user.email
                    });
                  } else {
                    setSelectedUserName('');
                    onUserDataChange?.({ name: '', email: '' });
                  }
                  
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === user.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {user.email ? user.email.split('@')[0] : 'Usuário'} ({user.email || 'Sem email'})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
