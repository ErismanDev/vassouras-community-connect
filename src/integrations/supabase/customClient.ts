
import { createClient } from '@supabase/supabase-js';
import { supabase } from './client';

// Export the already initialized supabase client to ensure singleton pattern
export { supabase };

// Create a custom client instance with the same configuration
const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjA0NjcsImV4cCI6MjA2MjYzNjQ2N30.z21Q1nmAwpAZ9OzChZ53ahazLZv5a3AORE7yj5q1ljk';

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
