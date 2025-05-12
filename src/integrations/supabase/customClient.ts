
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const SUPABASE_URL = "https://kbxqldzhawciprjiwtfk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjA0NjcsImV4cCI6MjA2MjYzNjQ2N30.z21Q1nmAwpAZ9OzChZ53ahazLZv5a3AORE7yj5q1ljk";

// Create a custom client without type restrictions
export const customSupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Export the original Supabase client from client.ts for consistency in our code
export { supabase } from './client';
