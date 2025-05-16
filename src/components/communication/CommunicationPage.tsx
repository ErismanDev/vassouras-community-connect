
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, Users } from 'lucide-react';
import MessagesFeed from './MessagesFeed';
import NewMessageForm from './NewMessageForm';

const CommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('messages');

  // We need to handle the success callback from NewMessageForm
  const handleMessageSuccess = () => {
    setActiveTab('messages');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Comunicação</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Comunicados</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Novo Comunicado</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages">
          <MessagesFeed />
        </TabsContent>
        
        <TabsContent value="new">
          {/* Pass onSuccess as a properly typed prop that NewMessageForm expects */}
          <NewMessageForm onMessageSuccess={handleMessageSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationPage;
