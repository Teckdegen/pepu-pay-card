// Re-export the Supabase client from the integration
export { supabase } from '@/integrations/supabase/client';

// Re-export User type from Supabase types
import type { Tables } from '@/integrations/supabase/types';
export type User = Tables<'users'>;
