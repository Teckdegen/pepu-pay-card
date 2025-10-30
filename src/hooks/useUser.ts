import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type User = Tables<'users'>;

export function useUser(address?: string) {
  return useSWR<User | null>(
    address ? ['user', address] : null,
    async () => {
      if (!address) return null;
      
      try {
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
      } catch (error) {
        console.error('Unexpected error fetching user:', error);
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      errorRetryCount: 60, // Retry up to 60 times on error (30 minutes with default 30s interval)
      errorRetryInterval: 30000, // Retry every 30 seconds
    }
  );
}