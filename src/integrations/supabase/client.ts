import { createClient } from '@supabase/supabase-js';

// Valores de ambiente ou constantes
const supabaseUrl = 'https://kbxqldzhawciprjiwtfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieHFsZHpoYXdjaXByaml3dGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjA0NjcsImV4cCI6MjA2MjYzNjQ2N30.z21Q1nmAwpAZ9OzChZ53ahazLZv5a3AORE7yj5q1ljk';

// Inicializa o cliente Supabase com configurações explícitas para garantir comportamento consistente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'vassouras-community-auth-token',
    debug: true
  }
});

// Verificar a autenticação atual e informar em console
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erro ao verificar a sessão do Supabase:', error);
  } else if (data.session) {
    console.log('Supabase: Usuário autenticado com ID:', data.session.user.id);
  } else {
    console.log('Supabase: Nenhum usuário autenticado');
  }
});

// Configurar listener de alteração de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase: Evento de autenticação:', event);
  if (session) {
    console.log('Supabase: Usuário autenticado:', session.user.id);
  } else {
    console.log('Supabase: Usuário desconectado');
  }
});
