
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  author_id: string;
  author: {
    name: string;
    email: string;
  };
}

const CategoryColors: Record<string, string> = {
  'aviso': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'evento': 'bg-green-100 text-green-800 border-green-200',
  'reunião': 'bg-blue-100 text-blue-800 border-blue-200',
  'segurança': 'bg-red-100 text-red-800 border-red-200',
  'geral': 'bg-gray-100 text-gray-800 border-gray-200',
};

const MessagesFeed: React.FC = () => {
  const fetchMessages = async () => {
    console.log('Fetching messages...');
    try {
      // Simple query without complex joins first to troubleshoot
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          title,
          content,
          category,
          created_at,
          author_id
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error(error.message);
      }
      
      console.log('Messages fetched:', data);
      
      // Now we need to fetch author details separately
      // This is a workaround if the join above isn't working
      const messagesWithAuthors = await Promise.all(
        data.map(async (message) => {
          // Try to get author info from auth.users via the get_user_role function
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, raw_user_meta_data')
            .eq('id', message.author_id)
            .single();
          
          let authorName = 'Usuário';
          let authorEmail = '';
          
          if (!userError && userData) {
            authorName = userData.raw_user_meta_data?.name || 
                         userData.email?.split('@')[0] || 
                         'Usuário';
            authorEmail = userData.email || '';
          } else {
            console.log('Could not fetch user details:', userError);
          }
          
          return {
            ...message,
            author: {
              name: authorName,
              email: authorEmail,
            },
          };
        })
      );
      
      return messagesWithAuthors;
    } catch (err) {
      console.error('Error in fetchMessages function:', err);
      throw err;
    }
  };

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando comunicados...</span>
      </div>
    );
  }

  if (error) {
    console.error('Error in messages query:', error);
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
        <p>Erro ao carregar comunicados. Tente novamente mais tarde.</p>
        <p className="text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <p className="text-gray-600">Não há comunicados disponíveis no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {messages.map((message: Message) => (
        <Card key={message.id} className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{message.title}</CardTitle>
              <Badge className={CategoryColors[message.category?.toLowerCase()] || CategoryColors.geral}>
                {message.category}
              </Badge>
            </div>
            <CardDescription>
              Por {message.author.name} • {new Date(message.created_at).toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MessagesFeed;
