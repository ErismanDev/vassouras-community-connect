
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MessagesFeed from '@/components/communication/MessagesFeed';
import NewMessageForm from '@/components/communication/NewMessageForm';
import { useAuth } from '@/contexts/AuthContext';
import { Send, MessageCircle } from 'lucide-react';

const CommunicationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('messages');
  
  // We need to handle the success callback from NewMessageForm
  const handleMessageSuccess = () => {
    setActiveTab('messages');
  };

  const canCreateMessages = user?.role === 'admin' || user?.role === 'director';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Comunicação Interna</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Comunicados</span>
          </TabsTrigger>
          
          {canCreateMessages && (
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Novo Comunicado</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="messages">
          <MessagesFeed />
        </TabsContent>
        
        {canCreateMessages && (
          <TabsContent value="create">
            <NewMessageForm onMessageSuccess={handleMessageSuccess} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CommunicationPage;
