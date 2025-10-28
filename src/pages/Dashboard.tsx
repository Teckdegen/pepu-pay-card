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
    user?.card_code && user?.email ? ['balance', user.card_code, user.email] : null,
    () => getCardBalance(user!.card_code!, user!.email),
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
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.first_name}!</h1>
            <p className="text-sm text-muted-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8">
            <h2 className="text-lg font-semibold mb-2 opacity-90">Card Balance</h2>
            <p className="text-5xl font-bold mb-4">${cardData.balance.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                cardData.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`} />
              <span className="text-sm capitalize">{cardData.status}</span>
            </div>
          </Card>

          {/* Virtual Card */}
          <VirtualCard
            cardNumber={cardData.cardNumber}
            expiryDate={cardData.expiryDate}
            cvv={cardData.cvv}
            cardholderName={cardData.cardholderName}
            balance={cardData.balance}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Top Up Form */}
          <TopUpForm
            onSuccess={() => {
              mutateBalance();
              mutateTransactions();
            }}
            cardCode={user.card_code!}
            walletAddress={address!}
          />

          {/* Transactions */}
          <TransactionList transactions={transactions || []} />
        </div>
      </div>
    </div>
  );
}
