import useSWR from 'swr';
import { fetchPepuPrice } from '@/lib/api';

export function usePepuPrice() {
  return useSWR('pepu-price', fetchPepuPrice, {
    refreshInterval: 60000, // Refresh every 60 seconds
    revalidateOnFocus: false,
  });
}
