
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { REQUEST_CATEGORIES, REQUEST_CATEGORY_LABELS } from '@/types/requests';
import { useRequests } from '@/hooks/use-requests';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const requestFormSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters long',
  }),
  category: z.enum(REQUEST_CATEGORIES as [string, ...string[]]),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters long',
  }),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;

export function RequestForm() {
  const { useCreateRequestMutation } = useRequests();
  const { mutate, isPending } = useCreateRequestMutation();
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      category: 'maintenance',
      description: '',
    },
  });

  const onSubmit = (values: RequestFormValues) => {
    mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief title of your request" {...field} />
              </FormControl>
              <FormDescription>
                Provide a clear title for your request
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REQUEST_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {REQUEST_CATEGORY_LABELS[category as keyof typeof REQUEST_CATEGORY_LABELS]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category that best fits your request
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed description of your request" 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Please provide as much detail as possible
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
}
