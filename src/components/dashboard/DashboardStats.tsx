
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from './StatCard';
import { Calendar, Users, MessageSquare, ListCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardStats() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        // Obter contagem de moradores (busca diretamente da tabela de perfis)
        const { count: residentsCount, error: residentsError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        if (residentsError) throw residentsError;
        
        // Obter contagem de solicitações
        const { count: requestsCount, error: requestsError } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true });
        
        if (requestsError) throw requestsError;
        
        // Obter solicitações pendentes
        const { count: pendingRequestsCount, error: pendingError } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (pendingError) throw pendingError;
        
        // Obter contagem de mensagens
        const { count: messagesCount, error: messagesError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });
        
        if (messagesError) throw messagesError;

        // Obter data da próxima reunião (se houver)
        const today = new Date();
        const { data: meetings, error: meetingsError } = await supabase
          .from('meeting_minutes')
          .select('meeting_date')
          .gte('meeting_date', today.toISOString().split('T')[0])
          .order('meeting_date', { ascending: true })
          .limit(1);
          
        let nextMeeting = null;
        if (!meetingsError && meetings && meetings.length > 0) {
          nextMeeting = {
            date: format(new Date(meetings[0].meeting_date), 'dd MMM', { locale: ptBR }),
            time: '16:00', // Horário padrão se não estiver disponível
          };
        }
        
        return {
          residents: residentsCount || 0,
          requests: requestsCount || 0,
          pendingRequests: pendingRequestsCount || 0,
          messages: messagesCount || 0,
          nextMeeting
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas do painel:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 mt-2" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Moradores"
        value={stats?.residents || 0}
        description="Total de moradores ativos"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Solicitações"
        value={stats?.requests || 0}
        description={`${stats?.pendingRequests || 0} pendentes`}
        icon={<ListCheck className="h-4 w-4" />}
      />
      <StatCard
        title="Comunicados"
        value={stats?.messages || 0}
        description="Comunicados da comunidade"
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <StatCard
        title="Próxima Reunião"
        value={stats?.nextMeeting ? stats.nextMeeting.date : 'A definir'}
        description={stats?.nextMeeting ? `${stats.nextMeeting.time} - Sala Comunitária` : 'Sem reuniões agendadas'}
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>
  );
}
