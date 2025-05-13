
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { REQUEST_STATUS_LABELS } from '@/types/requests';

export function StatusChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['request-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('status');
      
      if (error) throw error;
      
      const statuses = data.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      
      // Ensure all statuses are represented
      const allStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
      
      return allStatuses.map(status => ({
        name: REQUEST_STATUS_LABELS[status as keyof typeof REQUEST_STATUS_LABELS],
        value: statuses[status] || 0
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: []
  });
  
  const getBarColor = (name: string) => {
    switch(name) {
      case 'Pending': return '#FFBB28';
      case 'In Progress': return '#0088FE';
      case 'Resolved': return '#00C49F';
      case 'Rejected': return '#FF8042';
      default: return '#0088FE';
    }
  };
  
  if (isLoading || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request Status</CardTitle>
          <CardDescription>Overview of request statuses</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Status</CardTitle>
        <CardDescription>Overview of request statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
