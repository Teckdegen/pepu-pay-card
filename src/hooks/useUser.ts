import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type User = Tables<'users'>;

export function useUser(address?: string) {
  return useSWR<User | null>(
    address ? ['user', address] : null,
    async () => {
      if (!address) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
}
