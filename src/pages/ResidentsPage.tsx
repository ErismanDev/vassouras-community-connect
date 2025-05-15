import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResidentForm from '@/components/residents/ResidentForm';
import ResidentsList from '@/components/residents/ResidentsList';
import { UserPlus, Users } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Criar um cliente de consulta para React Query
const queryClient = new QueryClient();

const ResidentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento de Moradores</h1>
        
        <Tabs 
          defaultValue="list" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Lista de Moradores</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Cadastrar Morador</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <ResidentsList />
          </TabsContent>
          
          <TabsContent value="register">
            <ResidentForm />
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
};

export default ResidentsPage;
