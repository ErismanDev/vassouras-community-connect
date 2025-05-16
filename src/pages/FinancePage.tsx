
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TransactionsSection from '@/components/finance/TransactionsSection';
import MonthlyFeesSection from '@/components/finance/MonthlyFeesSection';
import FeeConfigurationSection from '@/components/finance/FeeConfigurationSection';
import FinancialReportsSection from '@/components/finance/FinancialReportsSection';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const FinancePage: React.FC = () => {
  const { user, session } = useAuth();
  const isAdminOrDirector = user?.role === 'admin' || user?.role === 'director';
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('transactions');
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Add loading state to ensure user role is determined
  useEffect(() => {
    if (user !== undefined) {
      setIsPageLoading(false);
    }
  }, [user]);

  // Redirect to transactions tab if user tries to access config without admin rights
  useEffect(() => {
    if (activeTab === 'config' && !isAdmin) {
      setActiveTab('transactions');
    }
  }, [activeTab, isAdmin]);

  if (isPageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-association-primary mr-2" />
        <span className="ml-2 text-lg font-medium">Carregando...</span>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!user || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
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
          {isAdmin && (
            <TabsTrigger value="config">Configuração</TabsTrigger>
          )}
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="relative z-10">
          <TransactionsSection isAdmin={isAdminOrDirector || false} />
        </TabsContent>
        
        {isAdminOrDirector && (
          <TabsContent value="fees" className="relative z-10">
            <MonthlyFeesSection />
          </TabsContent>
        )}
        
        {isAdmin && (
          <TabsContent value="config" className="relative z-10">
            <FeeConfigurationSection />
          </TabsContent>
        )}
        
        <TabsContent value="reports" className="relative z-10">
          <FinancialReportsSection isAdmin={isAdminOrDirector || false} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancePage;
