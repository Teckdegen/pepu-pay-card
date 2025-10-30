/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_PEPU_CHAIN_ID: string;
  readonly VITE_PEPU_RPC_URL: string;
  readonly VITE_TREASURY_WALLET_ADDRESS: string;
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
  readonly VITE_CASHWYRE_SECRET_KEY: string;
  readonly VITE_CASHWYRE_APP_ID: string;
  readonly VITE_CASHWYRE_BUSINESS_CODE: string;
  readonly VITE_TELEGRAM_BOT_TOKEN: string;
  readonly VITE_TELEGRAM_CHAT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}