
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BoardMembersSection from '@/components/admin/BoardMembersSection';
import ProjectsSection from '@/components/admin/ProjectsSection';
import MeetingMinutesSection from '@/components/admin/MeetingMinutesSection';
import AssemblyDecisionsSection from '@/components/admin/AssemblyDecisionsSection';

const AdminPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestão Administrativa</h1>
        
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="board">Diretoria</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="minutes">Atas</TabsTrigger>
            <TabsTrigger value="assembly">Assembleias</TabsTrigger>
          </TabsList>
          
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
    </DashboardLayout>
  );
};

export default AdminPage;
