
import React, { useEffect, useState } from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  onUserDataChange?: (userData: {name: string; email: string}) => void;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({ 
  value, 
  onChange,
  onUserDataChange
}) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email');
        
        if (error) {
          console.error('Erro ao buscar usuários:', error);
          return;
        }

        const usersWithNames = data.map((user: any) => ({
          id: user.id,
          email: user.email || '',
          name: user.email ? user.email.split('@')[0] : 'Usuário'
        }));
        
        setUsers(usersWithNames);

        // Set selected user name from value
        if (value) {
          const selectedUser = usersWithNames.find(user => user.id === value);
          if (selectedUser) {
            setSelectedUserName(selectedUser.name);
          }
        }

      } catch (error) {
        console.error('Erro ao processar usuários:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [value]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectUser = (userId: string, userData: {name: string; email: string}) => {
    onChange(userId);
    setSelectedUserName(userData.name);
    if (onUserDataChange) {
      onUserDataChange(userData);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedUserName ? selectedUserName : "Selecione um usuário"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar usuário..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Carregando usuários...</span>
            </div>
          ) : (
            <>
              <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id || 'user-id-fallback'}
                    onSelect={() => handleSelectUser(user.id, {
                      name: user.name || user.email.split('@')[0],
                      email: user.email
                    })}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserSearchSelect;
