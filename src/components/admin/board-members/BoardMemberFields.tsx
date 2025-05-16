
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import UserSelect from '../UserSelect';
import { UseFormReturn } from 'react-hook-form';

interface BoardMemberFieldsProps {
  form: UseFormReturn<any>;
  handleUserDataChange: (data: any) => void;
}

const BoardMemberFields: React.FC<BoardMemberFieldsProps> = ({ form, handleUserDataChange }) => {
  return (
    <>
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
    </>
  );
};

export default BoardMemberFields;
