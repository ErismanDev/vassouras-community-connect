
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, GavelIcon, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AssemblyDecisionsSection: React.FC = () => {
  const { user } = useAuth();
  const canManageDecisions = user?.role === 'admin' || user?.role === 'director';
  
  const { data: decisions, isLoading } = useQuery({
    queryKey: ['assemblyDecisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assembly_decisions')
        .select(`
          *,
          creator:created_by (
            email,
            user_metadata->name
          )
        `)
        .order('assembly_date', { ascending: false });

      if (error) throw error;
      
      return data.map((decision: any) => ({
        ...decision,
        creatorName: decision.creator?.user_metadata?.name || decision.creator?.email?.split('@')[0] || 'Usuário',
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando decisões...</span>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <GavelIcon className="h-6 w-6" />
            Decisões de Assembleia
          </h2>
          <p className="text-gray-500 mt-1">
            Registro de votações e decisões tomadas em assembleias
          </p>
        </div>
        
        {canManageDecisions && (
          <Button 
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Decisão
          </Button>
        )}
      </div>

      {!decisions?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma decisão de assembleia cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {decisions.map((decision: any) => (
            <Card key={decision.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{decision.title}</h3>
                    <Badge className={decision.approved ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {decision.approved ? 'Aprovado' : 'Reprovado'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">
                    Data da assembleia: {formatDate(decision.assembly_date)}
                  </p>
                  
                  <p className="mb-6 whitespace-pre-wrap">{decision.decision_text}</p>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col items-center p-2 bg-green-50 rounded-md">
                      <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
                      <span className="font-semibold text-green-700">{decision.votes_for}</span>
                      <span className="text-green-600">A favor</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-red-50 rounded-md">
                      <XCircle className="h-5 w-5 text-red-600 mb-1" />
                      <span className="font-semibold text-red-700">{decision.votes_against}</span>
                      <span className="text-red-600">Contra</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                      <span className="font-semibold text-gray-700">{decision.votes_abstain}</span>
                      <span className="text-gray-600">Abstenções</span>
                    </div>
                  </div>
                </div>
                
                {canManageDecisions && (
                  <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="default" size="sm">
                      Detalhes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssemblyDecisionsSection;
