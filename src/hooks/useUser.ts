import useSWR from 'swr';
import { supabase, User } from '@/lib/supabase';

export function useUser(address?: string) {
  return useSWR<User | null>(
    address ? ['user', address] : null,
    async () => {
      if (!address) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No user found
        throw error;
      }

      return data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
}
