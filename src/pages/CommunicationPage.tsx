
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MessagesFeed from '@/components/communication/MessagesFeed';
import NewMessageForm from '@/components/communication/NewMessageForm';
import { useAuth } from '@/contexts/AuthContext';

const CommunicationPage: React.FC = () => {
  const { user } = useAuth();
  const canCreateMessages = user?.role === 'admin' || user?.role === 'director';

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Comunicação Interna</h1>
        
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="messages">Comunicados</TabsTrigger>
            {canCreateMessages && (
              <TabsTrigger value="create">Novo Comunicado</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="messages">
            <MessagesFeed />
          </TabsContent>
          
          {canCreateMessages && (
            <TabsContent value="create">
              <NewMessageForm />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CommunicationPage;
