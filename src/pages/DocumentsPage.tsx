
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DocumentCategorySection from '@/components/documents/DocumentCategorySection';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const DOCUMENT_CATEGORIES = [
  'estatuto',
  'atas',
  'regulamentos',
  'financeiro',
  'projetos',
  'comunicados',
  'juridico',
  'diversos'
];

interface Document {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_type: string;
  created_at: string;
  visibility: 'all' | 'board' | 'admin';
}

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Check admin/board permissions
  const isAdminOrBoard = user?.role === 'admin' || user?.role === 'director';
  
  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Document[];
    }
  });
  
  // Filter documents based on search and category
  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      const matchesSearch = searchQuery ? 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) : 
        true;
        
      const matchesCategory = selectedCategory ? 
        doc.category === selectedCategory : 
        true;
        
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);
  
  // Group documents by category
  const documentsByCategory = React.useMemo(() => {
    const categories: Record<string, Document[]> = {};
    
    if (filteredDocuments) {
      filteredDocuments.forEach(doc => {
        if (!categories[doc.category]) {
          categories[doc.category] = [];
        }
        categories[doc.category].push(doc);
      });
    }
    
    return categories;
  }, [filteredDocuments]);
  
  const getCategoryCount = (category: string) => {
    return documentsByCategory[category]?.length || 0;
  };
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Gestão Documental</h1>
          {isAdminOrBoard && (
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              Enviar Documento
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Buscar</h3>
                <Input
                  placeholder="Pesquisar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Categorias</h3>
                <div className="space-y-2">
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <div
                      key={category}
                      className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                        selectedCategory === category
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <span className="capitalize">{category}</span>
                      <Badge variant="outline">{getCategoryCount(category)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Carregando documentos...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Nenhum documento encontrado.
                  {searchQuery && ' Tente uma pesquisa diferente.'}
                  {selectedCategory && ' Tente selecionar outra categoria.'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {selectedCategory ? (
                  documentsByCategory[selectedCategory]?.length > 0 && (
                    <DocumentCategorySection
                      key={selectedCategory}
                      category={selectedCategory}
                      documents={documentsByCategory[selectedCategory]}
                      isAdmin={isAdminOrBoard}
                    />
                  )
                ) : (
                  Object.entries(documentsByCategory).map(([category, docs]) => (
                    docs.length > 0 && (
                      <DocumentCategorySection
                        key={category}
                        category={category}
                        documents={docs}
                        isAdmin={isAdminOrBoard}
                      />
                    )
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Document Upload Dialog */}
        <DocumentUploadDialog 
          open={isUploadDialogOpen} 
          onOpenChange={setIsUploadDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;
