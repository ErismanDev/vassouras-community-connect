
import { useState } from 'react';
import { useRequests } from '@/hooks/use-requests';
import { Request, REQUEST_CATEGORIES, REQUEST_STATUS_LABELS, REQUEST_CATEGORY_LABELS } from '@/types/requests';
import { RequestCard } from './RequestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RequestsListProps {
  isAdmin: boolean;
}

export function RequestsList({ isAdmin }: RequestsListProps) {
  const { useRequestsQuery } = useRequests();
  const { data: requests = [], isLoading, error } = useRequestsQuery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  const filteredRequests = requests.filter(request => {
    // Search filter
    const matchesSearch = !searchTerm || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || request.status === statusFilter;
    
    // Category filter
    const matchesCategory = !categoryFilter || request.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading requests...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Error loading requests</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return <div className="text-center p-8">No requests found. Create a new request to get started.</div>;
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {REQUEST_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {REQUEST_CATEGORY_LABELS[category as keyof typeof REQUEST_CATEGORY_LABELS]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        {filteredRequests.length === 0 ? (
          <div className="text-center p-8">No requests match your filters</div>
        ) : (
          filteredRequests.map(request => (
            <RequestCard 
              key={request.id} 
              request={request} 
              isAdmin={isAdmin} 
            />
          ))
        )}
      </div>
    </div>
  );
}
