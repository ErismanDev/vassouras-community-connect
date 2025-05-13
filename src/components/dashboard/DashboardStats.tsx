
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from './StatCard';
import { Calendar, Users, MessageSquare, ListCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get residents count (placeholder - would need a residents table)
      const residentsCount = 24; // Placeholder value
      
      // Get requests count
      const { count: requestsCount, error: requestsError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true });
      
      if (requestsError) throw requestsError;
      
      // Get pending requests
      const { count: pendingRequestsCount, error: pendingError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Get messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      
      if (messagesError) throw messagesError;
      
      return {
        residents: residentsCount,
        requests: requestsCount || 0,
        pendingRequests: pendingRequestsCount || 0,
        messages: messagesCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        title="Residents"
        value={stats?.residents || 0}
        description="Total active residents"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Requests"
        value={stats?.requests || 0}
        description={`${stats?.pendingRequests || 0} pending`}
        icon={<ListCheck className="h-4 w-4" />}
      />
      <StatCard
        title="Messages"
        value={stats?.messages || 0}
        description="Community announcements"
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <StatCard
        title="Next Meeting"
        value="May 21"
        description="4:00 PM - Community Room"
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>
  );
}
