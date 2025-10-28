import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useUser } from '@/hooks/useUser';
import { getCardBalance, getCardTransactions } from '@/lib/api';
import { VirtualCard } from '@/components/ui/VirtualCard';
import { TransactionList } from '@/components/TransactionList';
import { TopUpForm } from '@/components/TopUpForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { data: user } = useUser(address);

  const {
    data: cardData,
    error: balanceError,
    mutate: mutateBalance,
  } = useSWR(
    user?.card_code && user?.email ? ['balance', user.card_code, user.email, user.customer_code] : null,
    () => getCardBalance(user!.card_code!, user!.email, user!.customer_code),
    { refreshInterval: 10000 }
  );

  const {
    data: transactions,
    error: txError,
    mutate: mutateTransactions,
  } = useSWR(
    user?.card_code ? ['transactions', user.card_code] : null,
    () => getCardTransactions(user!.card_code!),
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (!address) {
      navigate('/');
    } else if (!user?.card_code) {
      navigate('/pending');
    }
  }, [address, user, navigate]);

  useEffect(() => {
    if (balanceError) {
      toast.error('Failed to load card balance');
    }
    if (txError) {
      toast.error('Failed to load transactions');
    }
  }, [balanceError, txError]);

  const handleRefresh = () => {
    mutateBalance();
    mutateTransactions();
    toast.success('Data refreshed');
  };

  const handleLogout = () => {
    disconnect();
    navigate('/');
  };

  if (!user || !cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user.first_name}!</h1>
            <p className="text-muted-foreground mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh data"
              className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-700/50"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-700/50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Card Section - Prominently displayed */}
        <div className="mb-8">
          <VirtualCard
            cardNumber={cardData.cardNumber}
            expiryDate={cardData.expiryDate}
            cvv={cardData.cvv}
            cardholderName={cardData.cardholderName}
            balance={cardData.balance}
          />
        </div>

        {/* Info and Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-2xl shadow-2xl backdrop-blur-sm lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 opacity-90">Card Balance</h2>
            <p className="text-4xl md:text-5xl font-bold mb-2">${cardData.balance.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${
                cardData.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`} />
              <span className="text-sm capitalize">{cardData.status}</span>
            </div>
          </Card>

          {/* Top Up Form */}
          <div className="lg:col-span-2">
            <TopUpForm
              onSuccess={() => {
                mutateBalance();
                mutateTransactions();
              }}
              cardCode={user.card_code!}
              walletAddress={address!}
              userFirstName={user.first_name}
              userLastName={user.last_name}
              userEmail={user.email}
            />
          </div>

          {/* Transactions - Full width on mobile, spans appropriately on desktop */}
          <div className="lg:col-span-3">
            <TransactionList transactions={transactions || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
