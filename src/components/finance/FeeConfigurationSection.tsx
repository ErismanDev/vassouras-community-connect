import React, { useEffect, useState } from 'react';
import { useFeeConfiguration } from './fees/useFeeConfiguration';
import CurrentFeeCard from './fees/CurrentFeeCard';
import FeeHistoryTable from './fees/FeeHistoryTable';
import FeeDialogForm from './fees/FeeDialogForm';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const FeeConfigurationSection: React.FC = () => {
  const { user, session } = useAuth();
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const {
    feeConfigs,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    newFeeConfig,
    setNewFeeConfig,
    createFeeConfigMutation,
    currentFeeConfig
  } = useFeeConfiguration();

  // Verificar o status da autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Erro ao verificar autenticação:', error);
          setAuthStatus(`Erro: ${error.message}`);
          return;
        }
        
        if (data.user) {
          setAuthStatus(`Autenticado como: ${data.user.email} (ID: ${data.user.id})`);
        } else {
          setAuthStatus('Não autenticado');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthStatus(`Erro: ${(error as Error).message}`);
      }
    };
    
    checkAuth();
  }, []);

  const handleSubmit = () => {
    if (!user || user.role !== 'admin') {
      alert('Apenas administradores podem atualizar configurações de mensalidades');
      return;
    }
    
    if (!session) {
      alert('Sessão de usuário não disponível. Faça login novamente.');
      return;
    }
    
    console.log('Enviando com usuário:', user);
    console.log('Sessão disponível:', !!session);
    createFeeConfigMutation.mutate(newFeeConfig);
  };
  
  // Verificar se o usuário é administrador
  if (!user || user.role !== 'admin') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Apenas administradores podem acessar a configuração de mensalidades.
          <br />
          {authStatus && <span>Status de autenticação: {authStatus}</span>}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {authStatus && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Status de Autenticação</AlertTitle>
          <AlertDescription>{authStatus}</AlertDescription>
        </Alert>
      )}
      
      <CurrentFeeCard 
        currentFeeConfig={currentFeeConfig} 
        onOpenDialog={() => setIsDialogOpen(true)} 
      />
      
      <FeeHistoryTable 
        feeConfigs={feeConfigs} 
        isLoading={isLoading} 
      />
      
      <FeeDialogForm 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        feeFormState={newFeeConfig}
        setFeeFormState={setNewFeeConfig}
        isPending={createFeeConfigMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default FeeConfigurationSection;
