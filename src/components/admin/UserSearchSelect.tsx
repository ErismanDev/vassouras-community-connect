
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  onUserDataChange?: (userData: { name: string; email: string }) => void;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({ 
  value, 
  onChange,
  onUserDataChange 
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserData, setSelectedUserData] = useState<{name: string; email: string} | null>(null);
  
  // Fetch users from Supabase
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      // We need admin privileges to list users, calling a function instead of direct query
      const { data, error } = await supabase.rpc('list_users');
      
      if (error) throw error;
      
      // Format users data
      return data.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      }));
    },
  });

  // If a user is already selected, fetch their data
  useEffect(() => {
    if (value && !selectedUserData) {
      const fetchUser = async () => {
        try {
          const { data, error } = await supabase.rpc('list_users');
          if (error) throw error;
          
          const user = data.find((u: any) => u.id === value);
          if (user) {
            const userData = {
              name: user.name || user.email.split('@')[0],
              email: user.email
            };
            setSelectedUserData(userData);
            if (onUserDataChange) {
              onUserDataChange(userData);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUser();
    }
  }, [value, selectedUserData, onUserDataChange]);

  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleSelectUser = (userId: string, userData: {name: string; email: string}) => {
    onChange(userId);
    setSelectedUserData(userData);
    setOpen(false);
    if (onUserDataChange) {
      onUserDataChange(userData);
    }
  };

  const handleClear = () => {
    onChange('');
    setSelectedUserData(null);
    if (onUserDataChange) {
      onUserDataChange({ name: '', email: '' });
    }
  };

  return (
    <div className="relative">
      {selectedUserData ? (
        <div className="flex items-center gap-2">
          <Badge className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 flex items-center gap-2">
            {selectedUserData.name}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear selection</span>
            </Button>
          </Badge>
          <span className="text-xs text-muted-foreground">{selectedUserData.email}</span>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? users?.find((user) => user.id === value)?.name || "Selecionar usuário"
                : "Selecionar usuário"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput 
                placeholder="Buscar usuário..." 
                onValueChange={(search) => setSearchTerm(search)}
              />
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando usuários...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.id} // Ensure this value is not empty
                        onSelect={() => handleSelectUser(user.id, {
                          name: user.name || user.email.split('@')[0],
                          email: user.email
                        })}
                        className="flex flex-col items-start"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span>{user.name || user.email.split('@')[0]}</span>
                          {user.id === value && <Check className="h-4 w-4" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default UserSearchSelect;
