
import { createClient } from '@supabase/supabase-js';

// Ensure we're using environment variables or constants
const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjA0NjcsImV4cCI6MjA2MjYzNjQ2N30.z21Q1nmAwpAZ9OzChZ53ahazLZv5a3AORE7yj5q1ljk';

// Initialize the Supabase client with explicit auth settings to ensure consistent behavior
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});
