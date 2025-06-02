
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export interface DocumentPreview {
  file: File;
  preview: string;
  name: string;
}

interface DocumentUploaderProps {
  documents: Record<string, DocumentPreview | null>;
  setDocuments: (documents: Record<string, DocumentPreview | null>) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  setDocuments
}) => {
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file, documentType);
    }
  };

  const processFile = (file: File, documentType: string) => {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use apenas JPEG, PNG ou PDF.');
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file)
      : '';

    const documentPreview: DocumentPreview = {
      file,
      preview,
      name: file.name
    };

    setDocuments({
      ...documents,
      [documentType]: documentPreview
    });

    toast.success('Arquivo selecionado com sucesso!');
  };

  const handleDrop = (event: React.DragEvent, documentType: string) => {
    event.preventDefault();
    setDragOver(null);

    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file, documentType);
    }
  };

  const handleDragOver = (event: React.DragEvent, documentType: string) => {
    event.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const removeDocument = (documentType: string) => {
    if (documents[documentType]?.preview) {
      URL.revokeObjectURL(documents[documentType]!.preview);
    }
    setDocuments({
      ...documents,
      [documentType]: null
    });
    toast.success('Documento removido.');
  };

  const renderDocumentUploader = (
    documentType: string,
    label: string,
    description: string
  ) => {
    const document = documents[documentType];
    const isDragOver = dragOver === documentType;

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">{label}</Label>
          <p className="text-xs text-gray-500 mb-3">{description}</p>

          {document ? (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {document.preview ? (
                    <img
                      src={document.preview}
                      alt={document.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                      <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{document.name}</p>
                    <p className="text-xs text-gray-500">
                      {(document.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(documentType)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={(e) => handleDrop(e, documentType)}
              onDragOver={(e) => handleDragOver(e, documentType)}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arraste e solte um arquivo aqui ou
              </p>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileSelect(e, documentType)}
                className="hidden"
                id={`file-${documentType}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-${documentType}`)?.click()}
              >
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG ou PDF até 5MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Opcional:</strong> Você pode fazer o upload dos documentos agora ou posteriormente. 
          O cadastro pode ser realizado sem documentos.
        </p>
      </div>

      {renderDocumentUploader(
        'idDocument',
        'Documento de Identidade',
        'RG, CNH ou outro documento oficial com foto'
      )}

      {renderDocumentUploader(
        'proofOfResidence',
        'Comprovante de Residência',
        'Conta de luz, água, telefone ou contrato de aluguel'
      )}
    </div>
  );
};

export default DocumentUploader;
