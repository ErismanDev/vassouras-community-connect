
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Loader2, Check, AlertCircle } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  onUserDataChange?: (userData: {name?: string; email: string}) => void;
}

export default function UserSelect({ value, onChange, onUserDataChange }: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  
  // Create a reference to check if component is mounted
  const isMounted = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isMounted.current) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email');
        
        if (error) {
          console.error('Erro ao buscar usuários:', error);
          if (isMounted.current) {
            setError('Não foi possível carregar a lista de usuários.');
            toast.error('Erro ao carregar usuários. Tente novamente mais tarde.');
          }
          return;
        }

        if (!data || data.length === 0) {
          if (isMounted.current) {
            setUsers([]);
          }
          return;
        }

        const usersWithNames = data.map((user: any) => ({
          id: user.id || 'user-id-fallback',
          email: user.email || 'email@exemplo.com',
          name: user.email ? user.email.split('@')[0] : 'Usuário'
        }));
        
        if (isMounted.current) {
          setUsers(usersWithNames);

          // Set selected user name from value
          if (value) {
            const selectedUser = usersWithNames.find(user => user.id === value);
            if (selectedUser) {
              setSelectedUserName(selectedUser.name || selectedUser.email.split('@')[0]);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao processar usuários:', error);
        if (isMounted.current) {
          setError('Ocorreu um erro ao processar os dados dos usuários.');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
  }, [value]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectUser = (user: User) => {
    onChange(user.id);
    setSelectedUserName(user.name || user.email.split('@')[0]);
    if (onUserDataChange) {
      onUserDataChange({
        name: user.name,
        email: user.email
      });
    }
    
    // Close the popover with a timeout to avoid unmounting issues
    setTimeout(() => {
      if (isMounted.current) {
        setOpen(false);
      }
    }, 0);
  };

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        if (isMounted.current) {
          setOpen(isOpen);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {value && selectedUserName ? selectedUserName : "Selecione um usuário"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Buscar usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Carregando usuários...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-4 text-red-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="p-1">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Nenhum usuário encontrado.
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={cn(
                        "flex w-full items-center rounded-md px-2 py-2 text-left text-sm",
                        value === user.id 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{user.name || user.email.split('@')[0]}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
