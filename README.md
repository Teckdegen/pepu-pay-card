# Unchain Card - Virtual Debit Card dApp

A decentralized virtual debit card platform where users connect their wallet, pay with PEPU tokens, and receive a virtual Visa card via Cashwyre API.

## Features

- 🔗 **Web3 Wallet Integration** - Connect with Pepu Chain
- 💳 **Virtual Debit Cards** - Powered by Cashwyre Business API
- ⚡ **In-App Payments** - Pay with PEPU tokens directly from wallet
- 📊 **Real-time Balance** - View card balance and transaction history
- 💰 **Easy Top-ups** - Add funds to your card with PEPU
- 🎨 **Beautiful UI** - Responsive design with Unchain branding

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Web3**: Wagmi + RainbowKit + Viem
- **Database**: Supabase
- **API**: Cashwyre Business API
- **UI Components**: shadcn/ui

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <YOUR_GIT_URL>
   cd unchain-card
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in all required credentials
   - See [SETUP.md](./SETUP.md) for detailed instructions

3. **Setup Database**
   - Create Supabase project
   - Run SQL migration from SETUP.md
   - Update environment variables

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## How It Works

1. Users connect their Pepu Chain wallet
2. Fill out card application with Cashwyre customer code
3. Pay $30 + 5% fee in PEPU tokens (on-chain)
4. Card is created and linked to user account
5. Users can view card details, check balance, and top up

## Important Notes

- Users must have a Cashwyre customer account first
- Card creation and funding currently require manual steps
- See [SETUP.md](./SETUP.md) for complete workflow

## Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Cashwyre API Docs](https://businessapi.cashwyre.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Wagmi Docs](https://wagmi.sh)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # UI components (Card, Button, etc.)
│   ├── TransactionList.tsx
│   └── TopUpForm.tsx
├── hooks/              # Custom React hooks
│   ├── useUser.ts
│   └── usePepuPrice.ts
├── lib/                # Utilities and configurations
│   ├── api.ts          # API client functions
│   ├── cashwyre.ts     # Cashwyre types and utilities
│   ├── supabase.ts     # Supabase client
│   ├── telegram.ts     # Telegram notifications
│   └── wagmi.ts        # Wagmi configuration
├── pages/              # Page components
│   ├── Landing.tsx     # Onboarding & payment
│   ├── Pending.tsx     # Card creation wait
│   └── Dashboard.tsx   # Card management
└── App.tsx             # Root component
```

## License

MIT

## Support

For setup help, see [SETUP.md](./SETUP.md)