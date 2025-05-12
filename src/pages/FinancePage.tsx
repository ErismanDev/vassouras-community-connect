
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TransactionsSection from '@/components/finance/TransactionsSection';
import MonthlyFeesSection from '@/components/finance/MonthlyFeesSection';
import FeeConfigurationSection from '@/components/finance/FeeConfigurationSection';
import FinancialReportsSection from '@/components/finance/FinancialReportsSection';
import { useAuth } from '@/contexts/AuthContext';

const FinancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrDirector = user?.role === 'admin' || user?.role === 'director';
  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <DashboardLayout>
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
            <TransactionsSection isAdmin={isAdminOrDirector} />
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
            <FinancialReportsSection isAdmin={isAdminOrDirector} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;
