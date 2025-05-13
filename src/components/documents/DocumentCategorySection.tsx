
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, FileText } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Document {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_type: string;
  created_at: string;
  visibility: 'all' | 'board' | 'admin';
  description?: string;
}

interface DocumentCategorySectionProps {
  category: string;
  documents: Document[];
  isAdmin: boolean;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) {
    return <FileText className="h-12 w-12 text-red-500" />;
  } else if (fileType.includes('image')) {
    return null; // Will use image preview
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <FileText className="h-12 w-12 text-green-500" />;
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return <FileText className="h-12 w-12 text-blue-500" />;
  } else {
    return <FileText className="h-12 w-12 text-gray-500" />;
  }
};

const formatCategory = (category: string) => {
  const formattedCategories: Record<string, string> = {
    'estatuto': 'Estatuto',
    'atas': 'Atas de Assembleia',
    'regulamentos': 'Regimentos e Estatutos',
    'financeiro': 'Relatórios Financeiros',
    'projetos': 'Projetos e Obras',
    'comunicados': 'Comunicados',
    'juridico': 'Documentos Jurídicos',
    'diversos': 'Outros Documentos'
  };
  
  return formattedCategories[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

const DocumentCategorySection: React.FC<DocumentCategorySectionProps> = ({
  category,
  documents,
  isAdmin
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatCategory(category)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2">{doc.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: ptBR })}
                    </p>
                    {doc.visibility !== 'all' && (
                      <Badge variant="outline" className="mt-1">
                        {doc.visibility === 'board' ? 'Apenas Diretoria' : 'Apenas Admin'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="h-24 flex items-center justify-center mt-4 bg-gray-50 rounded">
                  {doc.file_type.includes('image') ? (
                    <AspectRatio ratio={16 / 9}>
                      <img 
                        src={doc.file_url} 
                        alt={doc.title}
                        className="rounded-md object-cover h-full w-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </AspectRatio>
                  ) : (
                    getFileIcon(doc.file_type)
                  )}
                </div>
                
                {doc.description && (
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2">{doc.description}</p>
                )}
                
                <div className="mt-3">
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCategorySection;
