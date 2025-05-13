
import { createClient } from '@supabase/supabase-js';
import { supabase } from './client';

// Export the already initialized supabase client to ensure singleton pattern
export { supabase };

// Create a custom client instance with enhanced options
const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzMTY2NTIsImV4cCI6MjAzMTg5MjY1Mn0.2Q0bO23N1z7SJRZkj6QX5e3YUy8V1z8XywQkcOIok8Q';

// Initialize and export a customSupabaseClient instance
export const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// If you need to create a custom client with additional options in the future,
// create a function that returns a new client instead of initializing it directly
export const createCustomClient = (customOptions = {}) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage
    },
    ...customOptions
  });
};
