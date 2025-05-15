
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Loader2, Save } from 'lucide-react';
import UserSelect from './UserSelect';
import BoardMemberFormHeader from './board-members/BoardMemberFormHeader';
import { useBoardMemberForm, FormValues } from './board-members/useBoardMemberForm';

interface BoardMemberFormProps {
  onClose: () => void;
  editingMember?: any;
}

const BoardMemberForm: React.FC<BoardMemberFormProps> = ({ onClose, editingMember }) => {
  const { form, isPending, onSubmit, handleUserDataChange, safeCancel } = useBoardMemberForm(onClose, editingMember);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BoardMemberFormHeader isEditing={!!editingMember} onCancel={safeCancel} />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário</FormLabel>
              <FormControl>
                <UserSelect 
                  value={field.value} 
                  onChange={field.onChange}
                  onUserDataChange={handleUserDataChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Presidente, Tesoureiro, etc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="termStart"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Início do Mandato</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fim do Mandato (opcional)</FormLabel>
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
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Biografia do membro da diretoria"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Foto (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="URL da foto do membro" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={safeCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
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

export default BoardMemberForm;
