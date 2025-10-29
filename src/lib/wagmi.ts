import { http, createConfig } from 'wagmi';
import { Chain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Pepu Chain Configuration
export const pepuChain = {
  id: Number(import.meta.env.VITE_PEPU_CHAIN_ID || 1),
  name: 'Pepu Chain',
  nativeCurrency: {
    name: 'PEPU',
    symbol: 'PEPU',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_PEPU_RPC_URL || 'https://rpc.pepu.chain'],
    },
    public: {
      http: [import.meta.env.VITE_PEPU_RPC_URL || 'https://rpc.pepu.chain'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Pepu Explorer',
      url: 'https://explorer.pepu.chain',
    },
  },
  testnet: false,
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: 'Unchain Card',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [pepuChain],
  transports: {
    [pepuChain.id]: http(pepuChain.rpcUrls.default.http[0]),
  },
  ssr: false,
});
