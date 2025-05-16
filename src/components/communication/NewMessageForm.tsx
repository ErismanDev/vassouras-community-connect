
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Send } from 'lucide-react';

interface NewMessageFormProps {
  onMessageSuccess?: () => void; // Changed from onSuccess to onMessageSuccess
}

const NewMessageForm: React.FC<NewMessageFormProps> = ({ onMessageSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const { mutate: createMessage, isPending } = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            title, 
            content,
            created_by: user?.id,
            author_name: user?.user_metadata?.name || 'Usuário',
          }
        ])
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Comunicado enviado com sucesso!');
      setTitle('');
      setContent('');
      if (onMessageSuccess) onMessageSuccess();
    },
    onError: () => {
      toast.error('Erro ao enviar comunicado. Tente novamente.');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('O título é obrigatório.');
      return;
    }
    
    if (!content.trim()) {
      toast.error('O conteúdo é obrigatório.');
      return;
    }
    
    createMessage({ title, content });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Comunicado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do comunicado"
              disabled={isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do comunicado"
              className="min-h-[200px]"
              disabled={isPending}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Comunicado
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewMessageForm;
