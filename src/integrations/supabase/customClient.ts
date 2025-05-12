
import { supabase } from './client';

// This wrapper allows us to use tables that aren't yet defined in the types.ts file
// without modifying the read-only types.ts file
export const customSupabaseClient = {
  from: (table: string) => {
    return supabase.from(table as any);
  }
};
