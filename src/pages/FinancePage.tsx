
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TransactionsSection from '@/components/finance/TransactionsSection';
import MonthlyFeesSection from '@/components/finance/MonthlyFeesSection';
import FeeConfigurationSection from '@/components/finance/FeeConfigurationSection';
import FinancialReportsSection from '@/components/finance/FinancialReportsSection';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const FinancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrDirector = user?.role === 'admin' || user?.role === 'director';
  const [activeTab, setActiveTab] = useState('transactions');
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Adiciona um estado de carregamento para garantir que os componentes não renderizem até que o papel do usuário seja determinado
  useEffect(() => {
    if (user !== undefined) {
      setIsPageLoading(false);
    }
  }, [user]);

  if (isPageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-association-primary mr-2" />
        <span className="ml-2 text-lg font-medium">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Finanças e Transparência</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          {isAdminOrDirector && (
            <TabsTrigger value="fees">Mensalidades</TabsTrigger>
          )}
          {user?.role === 'admin' && (
            <TabsTrigger value="config">Configuração</TabsTrigger>
          )}
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <TransactionsSection isAdmin={isAdminOrDirector || false} />
        </TabsContent>
        
        {isAdminOrDirector && (
          <TabsContent value="fees">
            <MonthlyFeesSection />
          </TabsContent>
        )}
        
        {user?.role === 'admin' && (
          <TabsContent value="config">
            <FeeConfigurationSection />
          </TabsContent>
        )}
        
        <TabsContent value="reports">
          <FinancialReportsSection isAdmin={isAdminOrDirector || false} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;
