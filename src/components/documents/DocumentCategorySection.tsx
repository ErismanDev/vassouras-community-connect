
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, File, FilePdf, FileText, FileSpreadsheet } from 'lucide-react';

interface DocumentProps {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_type: string;
  created_at: string;
  visibility: 'all' | 'board' | 'admin';
}

interface DocumentCategorySectionProps {
  category: string;
  documents: DocumentProps[];
  isAdmin: boolean;
}

const DocumentCategorySection: React.FC<DocumentCategorySectionProps> = ({ 
  category, 
  documents,
  isAdmin
}) => {
  // Get the appropriate icon for the file type
  const getDocumentIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="h-10 w-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  // Get badge color based on visibility
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'all':
        return <Badge variant="outline">Todos</Badge>;
      case 'board':
        return <Badge variant="secondary">Diretoria</Badge>;
      case 'admin':
        return <Badge variant="default">Administradores</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold capitalize">{category}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 flex items-center gap-4 border-b">
                  {getDocumentIcon(document.file_type)}
                  <div className="flex-grow">
                    <h3 className="font-medium line-clamp-2" title={document.title}>
                      {document.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(document.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between mt-auto">
                  <div>
                    {isAdmin && getVisibilityBadge(document.visibility)}
                  </div>
                  <a 
                    href={document.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:text-primary/80 transition-colors"
                    download
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span>Baixar</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentCategorySection;
