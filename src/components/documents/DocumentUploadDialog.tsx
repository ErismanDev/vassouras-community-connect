
import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'board' | 'admin'>('all');
  const [file, setFile] = useState<File | null>(null);
  
  const uploadDocumentMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('Nenhum arquivo selecionado');
      }
      
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${title.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('association_documents_files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('association_documents_files')
        .getPublicUrl(fileName);
      
      // 3. Create document record
      const { error: docError } = await supabase.from('documents').insert([
        {
          title,
          category,
          visibility,
          file_url: publicUrl,
          file_type: fileExt,
          description: `${category} - ${title}`
        }
      ]);
      
      if (docError) throw docError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onOpenChange(false);
      resetForm();
      toast.success('Documento enviado com sucesso!');
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento. Tente novamente.');
    }
  });
  
  const resetForm = () => {
    setTitle('');
    setCategory('');
    setVisibility('all');
    setFile(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadDocumentMutation.mutate();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Novo Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Documento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibilidade</Label>
            <Select value={visibility} onValueChange={(value: 'all' | 'board' | 'admin') => setVisibility(value)} required>
              <SelectTrigger id="visibility">
                <SelectValue placeholder="Selecione a visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os moradores</SelectItem>
                <SelectItem value="board">Apenas diretoria</SelectItem>
                <SelectItem value="admin">Apenas administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-file">Arquivo</Label>
            <Input
              id="document-file"
              type="file"
              onChange={handleFileChange}
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadDocumentMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploadDocumentMutation.isPending || !title || !category || !file}
            >
              {uploadDocumentMutation.isPending ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
