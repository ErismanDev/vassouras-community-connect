
import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Request, 
  RequestResponse, 
  REQUEST_STATUS_COLORS, 
  REQUEST_STATUS_LABELS,
  REQUEST_CATEGORY_LABELS 
} from '@/types/requests';
import { useRequests } from '@/hooks/use-requests';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface RequestCardProps {
  request: Request;
  isAdmin: boolean;
}

export function RequestCard({ request, isAdmin }: RequestCardProps) {
  const [showResponses, setShowResponses] = useState(false);
  const [newResponse, setNewResponse] = useState('');
  
  const { useRequestResponsesQuery, useAddResponseMutation, useUpdateRequestStatusMutation } = useRequests();
  const { data: responses = [], isLoading: isLoadingResponses } = useRequestResponsesQuery(request.id);
  const { mutate: addResponse, isPending: isAddingResponse } = useAddResponseMutation();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateRequestStatusMutation();

  const handleSubmitResponse = () => {
    if (!newResponse.trim()) return;
    
    addResponse({
      requestId: request.id,
      response: newResponse
    }, {
      onSuccess: () => {
        setNewResponse('');
      }
    });
  };

  const handleStatusChange = (status: Request['status']) => {
    updateStatus({
      requestId: request.id,
      status
    });
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription>
              {REQUEST_CATEGORY_LABELS[request.category as keyof typeof REQUEST_CATEGORY_LABELS]} • 
              {format(new Date(request.created_at), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${REQUEST_STATUS_COLORS[request.status]}`}>
              {REQUEST_STATUS_LABELS[request.status]}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
        
        {responses.length > 0 && (
          <div className="mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto flex items-center text-sm"
              onClick={() => setShowResponses(!showResponses)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {responses.length} {responses.length === 1 ? 'response' : 'responses'}
              {showResponses ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
            
            {showResponses && (
              <div className="mt-2 space-y-3">
                {responses.map(response => (
                  <div key={response.id} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{response.response}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(response.created_at), 'MMM dd, yyyy • HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-stretch pt-2">
        {isAdmin && (
          <div className="w-full mb-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  Respond & Manage
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Respond to Request</SheetTitle>
                  <SheetDescription>
                    Add a response to this request and update its status
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'in_progress', 'resolved', 'rejected'].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={request.status === status ? "default" : "outline"}
                          onClick={() => handleStatusChange(status as Request['status'])}
                          disabled={isUpdatingStatus}
                          className="text-xs"
                        >
                          {REQUEST_STATUS_LABELS[status as Request['status']]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Add Response</h4>
                    <Textarea 
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Write your response here..."
                      className="min-h-32"
                    />
                    <Button 
                      onClick={handleSubmitResponse}
                      disabled={isAddingResponse || !newResponse.trim()}
                      className="mt-2 w-full"
                    >
                      {isAddingResponse ? 'Sending...' : 'Send Response'}
                    </Button>
                  </div>
                  
                  {responses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Previous Responses</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {responses.map(response => (
                          <div key={response.id} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">{response.response}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(response.created_at), 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
