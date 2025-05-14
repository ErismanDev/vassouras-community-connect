
// Exporte o cliente supabase já inicializado para garantir o padrão singleton
export { supabase } from './client';

// Se precisar criar um cliente personalizado com opções adicionais no futuro,
// utilize esta função que retorna um novo cliente em vez de inicializá-lo diretamente
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjA0NjcsImV4cCI6MjA2MjYzNjQ2N30.z21Q1nmAwpAZ9OzChZ53ahazLZv5a3AORE7yj5q1ljk';

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
