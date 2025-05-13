
export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface RequestResponse {
  id: string;
  request_id: string;
  response: string;
  created_by: string;
  created_at: string;
}

export const REQUEST_CATEGORIES = [
  'maintenance',
  'noise_complaint',
  'security',
  'common_areas',
  'suggestion',
  'other'
];

export const REQUEST_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export const REQUEST_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

export const REQUEST_CATEGORY_LABELS = {
  maintenance: 'Maintenance',
  noise_complaint: 'Noise Complaint',
  security: 'Security',
  common_areas: 'Common Areas',
  suggestion: 'Suggestion',
  other: 'Other'
};
