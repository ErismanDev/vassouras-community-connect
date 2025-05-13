
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customSupabaseClient } from '@/integrations/supabase/customClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DocumentUploadDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('atas');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'board' | 'admin'>('all');
  const [file, setFile] = useState<File | null>(null);

  // Use controlled or uncontrolled state based on props
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !user) throw new Error('File and user are required');
      
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await customSupabaseClient.storage
        .from('documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const fileUrl = customSupabaseClient.storage
        .from('documents')
        .getPublicUrl(fileName).data.publicUrl;
      
      // Save document metadata in the database
      const { error: dbError } = await customSupabaseClient
        .from('documents')
        .insert([
          {
            title,
            category,
            visibility,
            file_url: fileUrl,
            file_type: file.type,
            description
          }
        ]);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      resetForm();
      setDialogOpen(false);
      toast.success('Documento enviado com sucesso!');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento. Por favor, tente novamente.');
    }
  });

  const resetForm = () => {
    setTitle('');
    setCategory('atas');
    setDescription('');
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
    if (!file) {
      toast.error('Por favor, selecione um arquivo para enviar.');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className={onOpenChange ? 'hidden' : ''}>Enviar Novo Documento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ata da Assembleia de Março/2024"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atas">Atas de Assembleia</SelectItem>
                    <SelectItem value="regimentos">Regimentos e Estatutos</SelectItem>
                    <SelectItem value="financeiros">Relatórios Financeiros</SelectItem>
                    <SelectItem value="projetos">Projetos e Obras</SelectItem>
                    <SelectItem value="outros">Outros Documentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilidade</Label>
                <Select 
                  value={visibility} 
                  onValueChange={(val) => setVisibility(val as 'all' | 'board' | 'admin')}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Quem pode acessar?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os moradores</SelectItem>
                    <SelectItem value="board">Apenas diretoria</SelectItem>
                    <SelectItem value="admin">Apenas administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma breve descrição do documento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={uploadMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!file || !title || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
