import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface DocumentPreview {
  name: string;
  url: string;
  file: File;
}

interface DocumentUploaderProps {
  documents: Record<string, DocumentPreview | null>;
  setDocuments: React.Dispatch<React.SetStateAction<Record<string, DocumentPreview | null>>>;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ documents, setDocuments }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPG, PNG ou PDF.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O limite é 5MB.');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setDocuments(prev => ({
      ...prev,
      [documentType]: {
        name: file.name,
        url,
        file,
      }
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ID Document Upload */}
      <div className="space-y-2">
        <Label htmlFor="idDocument">RG/Documento de Identidade *</Label>
        <div className="border border-dashed border-gray-300 rounded-md p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              {documents.idDocument ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {documents.idDocument.name}
                  </p>
                  {documents.idDocument.file.type.startsWith('image/') && (
                    <div className="mt-2 max-h-32 overflow-hidden">
                      <img 
                        src={documents.idDocument.url} 
                        alt="Preview" 
                        className="h-auto max-w-full rounded-md"
                      />
                    </div>
                  )}
                  {documents.idDocument.file.type === 'application/pdf' && (
                    <div className="mt-2 text-gray-500">
                      Arquivo PDF
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setDocuments(prev => ({ ...prev, idDocument: null }))}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <label 
                  htmlFor="idDocument" 
                  className="cursor-pointer text-center block w-full"
                >
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-association-primary">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG ou PDF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                  <Input
                    id="idDocument"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'idDocument')}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Proof of Residence Upload */}
      <div className="space-y-2">
        <Label htmlFor="proofOfResidence">Comprovante de Residência *</Label>
        <div className="border border-dashed border-gray-300 rounded-md p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              {documents.proofOfResidence ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {documents.proofOfResidence.name}
                  </p>
                  {documents.proofOfResidence.file.type.startsWith('image/') && (
                    <div className="mt-2 max-h-32 overflow-hidden">
                      <img 
                        src={documents.proofOfResidence.url} 
                        alt="Preview" 
                        className="h-auto max-w-full rounded-md"
                      />
                    </div>
                  )}
                  {documents.proofOfResidence.file.type === 'application/pdf' && (
                    <div className="mt-2 text-gray-500">
                      Arquivo PDF
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setDocuments(prev => ({ ...prev, proofOfResidence: null }))}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <label 
                  htmlFor="proofOfResidence" 
                  className="cursor-pointer text-center block w-full"
                >
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-association-primary">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG ou PDF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                  <Input
                    id="proofOfResidence"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'proofOfResidence')}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
