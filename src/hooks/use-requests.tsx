
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Request, RequestResponse } from '@/types/requests';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchRequests = async (): Promise<Request[]> => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load requests',
        variant: 'destructive',
      });
      throw error;
    }
    
    return data || [];
  };

  const fetchRequestResponses = async (requestId: string): Promise<RequestResponse[]> => {
    const { data, error } = await supabase
      .from('request_responses')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching request responses:', error);
      throw error;
    }
    
    return data || [];
  };

  const createRequest = async (newRequest: Omit<Request, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>): Promise<Request> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        ...newRequest,
        user_id: user.data.user.id,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating request:', error);
      throw error;
    }
    
    return data;
  };

  const addResponse = async ({ requestId, response }: { requestId: string, response: string }): Promise<RequestResponse> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('request_responses')
      .insert({
        request_id: requestId,
        response,
        created_by: user.data.user.id,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding response:', error);
      throw error;
    }
    
    return data;
  };

  const updateRequestStatus = async ({ requestId, status }: { requestId: string, status: Request['status'] }): Promise<Request> => {
    const { data, error } = await supabase
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
    
    return data;
  };

  const useRequestsQuery = () => {
    return useQuery({
      queryKey: ['requests'],
      queryFn: fetchRequests,
    });
  };

  const useRequestResponsesQuery = (requestId: string) => {
    return useQuery({
      queryKey: ['request-responses', requestId],
      queryFn: () => fetchRequestResponses(requestId),
      enabled: !!requestId,
    });
  };

  const useCreateRequestMutation = () => {
    return useMutation({
      mutationFn: createRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requests'] });
        toast({
          title: 'Request Created',
          description: 'Your request has been submitted successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to create request: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  const useAddResponseMutation = () => {
    return useMutation({
      mutationFn: addResponse,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['request-responses', variables.requestId] });
        toast({
          title: 'Response Added',
          description: 'Your response has been added successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to add response: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  const useUpdateRequestStatusMutation = () => {
    return useMutation({
      mutationFn: updateRequestStatus,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requests'] });
        toast({
          title: 'Status Updated',
          description: 'Request status has been updated successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to update status: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    useRequestsQuery,
    useRequestResponsesQuery,
    useCreateRequestMutation,
    useAddResponseMutation,
    useUpdateRequestStatusMutation,
  };
};
