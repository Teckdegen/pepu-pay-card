import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useUser } from '@/hooks/useUser';
import { getCardBalance, getCardTransactions } from '@/lib/api';
import { VirtualCard } from '@/components/ui/VirtualCard';
import { TransactionList } from '@/components/TransactionList';
import { TopUpForm } from '@/components/TopUpForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, Server, Database, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { data: user } = useUser(address);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: cardData,
    error: balanceError,
    mutate: mutateBalance,
  } = useSWR(
    user?.card_code && user?.email ? ['balance', user.card_code, user.email, user.customer_code] : null,
    () => getCardBalance(user!.card_code!, user!.email, user!.customer_code),
    { 
      refreshInterval: 30000,
      onError: (error) => {
        console.error('Balance fetch error:', error);
      }
    }
  );

  const {
    data: transactions,
    error: txError,
    mutate: mutateTransactions,
  } = useSWR(
    user?.card_code ? ['transactions', user.card_code] : null,
    () => getCardTransactions(user!.card_code!),
    { 
      refreshInterval: 60000,
      onError: (error) => {
        console.error('Transactions fetch error:', error);
      }
    }
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
      toast.error('Failed to load card balance: ' + balanceError.message);
    }
    if (txError) {
      toast.error('Failed to load transactions: ' + txError.message);
    }
  }, [balanceError, txError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        mutateBalance(),
        mutateTransactions()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    disconnect();
    navigate('/');
  };

  if (!user || !cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <Server className="w-16 h-16 mx-auto text-cyan-500/50 mb-4 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-cyan-500/20 blur-xl rounded-full"></div>
          </div>
          <p className="text-cyan-300/70 font-mono">Connecting to blockchain...</p>
          <p className="text-muted-foreground mt-2">Loading your card data</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 font-mono">
              Welcome, {user.first_name}!
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Wallet className="w-4 h-4 text-cyan-500/70" />
              <p className="text-cyan-500/70 font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh data"
              className="bg-gray-800/50 border-cyan-500/30 backdrop-blur-sm hover:bg-gray-700/50 text-cyan-300"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 bg-gray-800/50 border-cyan-500/30 backdrop-blur-sm hover:bg-gray-700/50 text-cyan-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-mono">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Status Bar */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-cyan-500/20">
            <Database className="w-5 h-5 text-cyan-500/70" />
            <span className="text-cyan-300/70 font-mono text-sm">Card Status:</span>
            <span className="text-cyan-300 font-mono text-sm capitalize">{cardData.status}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-cyan-500/20">
            <Server className="w-5 h-5 text-cyan-500/70" />
            <span className="text-cyan-300/70 font-mono text-sm">Network:</span>
            <span className="text-cyan-300 font-mono text-sm">Connected</span>
          </div>
        </div>

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
          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 text-cyan-100 p-6 rounded-2xl shadow-2xl backdrop-blur-sm border border-cyan-500/30 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-6 h-6 text-cyan-400" />
              <h2 className="text-lg font-semibold font-mono">Card Balance</h2>
            </div>
            <p className="text-4xl md:text-5xl font-bold mb-2 font-mono">${cardData.balance.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${
                cardData.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`} />
              <span className="text-sm capitalize font-mono">{cardData.status}</span>
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