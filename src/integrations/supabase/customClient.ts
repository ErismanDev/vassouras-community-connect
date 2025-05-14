
// Export the client supabase already initialized to ensure singleton pattern
export { supabase } from './client';

// If you need to create a custom client with additional options in the future,
// use this function that returns a new client instead of initializing it directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjA0NjcsImV4cCI6MjA2MjYzNjQ2N30.z21Q1nmAwpAZ9OzChZ53ahazLZv5a3AORE7yj5q1ljk';

// Create and export a customSupabaseClient instance with default options
export const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

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
