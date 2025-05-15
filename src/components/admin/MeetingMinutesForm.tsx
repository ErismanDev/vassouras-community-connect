
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Save, X, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';

const formSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  meetingDate: z.date({
    required_error: "Data da reunião é obrigatória",
  }),
  content: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
});

type FormValues = z.infer<typeof formSchema>;

interface MeetingMinutesFormProps {
  onClose: () => void;
  editingMinute?: any;
}

const MeetingMinutesForm: React.FC<MeetingMinutesFormProps> = ({ onClose, editingMinute }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      meetingDate: new Date(),
      content: '',
    },
  });

  useEffect(() => {
    if (editingMinute) {
      let meetingDate;
      try {
        meetingDate = editingMinute.meeting_date ? new Date(editingMinute.meeting_date) : new Date();
        if (isNaN(meetingDate.getTime())) {
          meetingDate = new Date();
        }
      } catch (error) {
        meetingDate = new Date();
      }
      
      form.reset({
        title: editingMinute.title || '',
        meetingDate: meetingDate,
        content: editingMinute.content || '',
      });
    }
  }, [editingMinute, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setDocumentFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `meeting-minutes/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Falha ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      let documentUrl = editingMinute?.document_url;
      
      if (documentFile) {
        documentUrl = await uploadFile(documentFile);
      }
      
      const minuteData = {
        title: values.title,
        meeting_date: values.meetingDate.toISOString().split('T')[0],
        content: values.content,
        document_url: documentUrl,
        created_by: user?.id,
      };

      if (editingMinute) {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update(minuteData)
          .eq('id', editingMinute.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('meeting_minutes')
          .insert(minuteData)
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetingMinutes'] });
      toast.success(editingMinute ? 'Ata atualizada com sucesso!' : 'Ata criada com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {editingMinute ? 'Editar Ata de Reunião' : 'Nova Ata de Reunião'}
          </h3>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da ata" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meetingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Reunião</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo da Ata</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o conteúdo da ata de reunião"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel htmlFor="document">Anexar Documento (opcional)</FormLabel>
          <div className="mt-1">
            <div className="flex items-center space-x-2">
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
              />
              {documentFile && (
                <p className="text-sm text-gray-500">{documentFile.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || uploading}>
            {(isPending || uploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MeetingMinutesForm;
