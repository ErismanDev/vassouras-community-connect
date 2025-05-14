
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import BoardMembersSection from '@/components/admin/BoardMembersSection';
import ProjectsSection from '@/components/admin/ProjectsSection';
import MeetingMinutesSection from '@/components/admin/MeetingMinutesSection';
import AssemblyDecisionsSection from '@/components/admin/AssemblyDecisionsSection';

const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('board');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      toast.error('Acesso não autorizado. Redirecionando...', {
        duration: 3000,
      });
      navigate('/unauthorized');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Reset error when changing tabs
    setError(null);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestão Administrativa</h1>
      
      <Tabs defaultValue="board" className="w-full" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="board">Diretoria</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="minutes">Atas</TabsTrigger>
          <TabsTrigger value="assembly">Assembleias</TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <TabsContent value="board">
          <BoardMembersSection />
        </TabsContent>
        
        <TabsContent value="projects">
          <ProjectsSection />
        </TabsContent>
        
        <TabsContent value="minutes">
          <MeetingMinutesSection />
        </TabsContent>
        
        <TabsContent value="assembly">
          <AssemblyDecisionsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
