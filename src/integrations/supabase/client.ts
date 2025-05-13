
import { createClient } from '@supabase/supabase-js';

// Ensure we're using environment variables or constants
const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzMTY2NTIsImV4cCI6MjAzMTg5MjY1Mn0.2Q0bO23N1z7SJRZkj6QX5e3YUy8V1z8XywQkcOIok8Q';

// Initialize the Supabase client with explicit auth settings to ensure consistent behavior
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});
