
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RequestForm } from '@/components/requests/RequestForm';
import { RequestsList } from '@/components/requests/RequestsList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<string>('list');
  
  const { data: userMeta } = useQuery({
    queryKey: ['user-meta'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.user_metadata || {};
    }
  });
  
  const isAdmin = userMeta?.role === 'admin' || userMeta?.role === 'director';
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Requests & Suggestions</h1>
          <p className="text-muted-foreground">Submit and track your requests to the building management</p>
        </div>
        
        <div className="sm:ml-auto">
          <Button 
            onClick={() => setActiveTab(activeTab === 'list' ? 'new' : 'list')}
          >
            {activeTab === 'list' ? 'New Request' : 'View Requests'}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">My Requests</TabsTrigger>
          <TabsTrigger value="new">New Request</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card className="p-4">
            <RequestsList isAdmin={isAdmin} />
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Submit a New Request</h2>
            <RequestForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
