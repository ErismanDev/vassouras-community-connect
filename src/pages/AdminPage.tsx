
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import MeetingMinutesSection from '@/components/admin/MeetingMinutesSection';
import AssemblyDecisionsSection from '@/components/admin/AssemblyDecisionsSection';
import ProjectsSection from '@/components/admin/ProjectsSection';
import BoardMembersSection from '@/components/admin/BoardMembersSection';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('boardMembers');

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Administração</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="boardMembers">Diretoria</TabsTrigger>
          <TabsTrigger value="meetingMinutes">Atas</TabsTrigger>
          <TabsTrigger value="decisions">Decisões</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="boardMembers" className="space-y-6">
          <BoardMembersSection />
        </TabsContent>
        
        <TabsContent value="meetingMinutes" className="space-y-6">
          <MeetingMinutesSection />
        </TabsContent>
        
        <TabsContent value="decisions" className="space-y-6">
          <AssemblyDecisionsSection />
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <ProjectsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
