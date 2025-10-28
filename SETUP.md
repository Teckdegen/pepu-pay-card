# Unchain Card Setup Guide

## Overview
Unchain Card is a decentralized virtual debit card platform that integrates:
- Web3 wallet connectivity (Pepu Chain)
- Cashwyre Business API for virtual card issuance
- On-chain PEPU token payments
- Supabase for user management

## Prerequisites

1. **Supabase Account**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Run the SQL migration (see Database Setup below)

2. **Cashwyre Business Account**
   - Register at [Cashwyre Business](https://businessapi.cashwyre.com)
   - Get your API credentials:
     - SECRET_KEY
     - APP_ID
     - BUSINESS_CODE

3. **WalletConnect Project**
   - Create a project at [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Get your PROJECT_ID

4. **Pepu Chain Access**
   - RPC URL
   - Chain ID
   - Treasury wallet address for receiving payments

5. **Telegram Bot (Optional)**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Get bot token and chat ID

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  customer_code TEXT,
  card_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for development (enable and configure for production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_card ON users(card_code);
```

## Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the values in `.env.local`

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Cashwyre Integration Notes

### Important API Details

1. **Customer Creation**
   - Must be done manually via Cashwyre dashboard first
   - Each user needs a customer account before getting a card
   - You'll receive a `customerCode` after creation

2. **Card Creation**
   - Also done manually via Cashwyre dashboard
   - Requires existing `customerCode`
   - Returns `cardCode` which is stored in Supabase

3. **Available API Endpoints**
   - **GET Card Details**: `CustomerCard/getCards`
     - Returns card number, CVV, expiry, balance, status
     - Requires `customerEmail` or `customerCode`
   
   - **GET Transactions**: `CustomerCard/getCardTransactions`
     - Returns transaction history
     - Requires `cardCode`

4. **Card Funding**
   - Currently no API endpoint for funding
   - Must be done manually via Cashwyre dashboard
   - When users "top up", app sends Telegram notification
   - Admin must manually fund the card

### Workflow

1. User connects wallet
2. User fills onboarding form (including customerCode from Cashwyre)
3. User pays $30 + 5% fee in PEPU tokens
4. App stores user info in Supabase
5. App redirects to pending page
6. Admin manually creates card in Cashwyre dashboard
7. Admin updates Supabase with `card_code`
8. User redirected to dashboard automatically

## User Flow

### Landing Page (/)
- Connect Pepu wallet
- Fill application form with Cashwyre customer code
- Pay $30 + 5% fee in PEPU tokens
- Transaction confirmed on-chain

### Pending Page (/pending)
- Shows loading state
- Polls Supabase every 3 seconds
- Auto-redirects when card_code appears

### Dashboard (/dashboard)
- View card details (number, CVV, expiry, balance)
- See transaction history
- Top up card with PEPU tokens
- Logout

## Production Considerations

1. **Security**
   - Enable Supabase RLS policies
   - Move API keys to secure backend
   - Use HTTPS only
   - Validate all inputs

2. **Cashwyre Automation**
   - Consider building backend service for card creation
   - Set up webhooks if Cashwyre adds support
   - Automate card funding if API becomes available

3. **Error Handling**
   - Add retry logic for failed transactions
   - Better error messages for users
   - Monitoring and alerts

4. **Testing**
   - Test with testnet first
   - Verify all payment flows
   - Check transaction confirmations

## Troubleshooting

### "Card not found" error
- Verify `card_code` exists in Supabase
- Check Cashwyre dashboard for card status
- Ensure `customerEmail` matches

### Transaction not confirming
- Check Pepu chain RPC status
- Verify treasury wallet address
- Check gas prices

### Price fetch fails
- CoinGecko API might be rate-limited
- Update to use correct PEPU coin ID
- Consider caching price data

## Support

For issues with:
- Cashwyre API: Contact Cashwyre support
- Supabase: Check [Supabase docs](https://supabase.com/docs)
- Web3 integration: Check [Wagmi docs](https://wagmi.sh)