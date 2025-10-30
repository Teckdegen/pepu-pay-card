import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { Wallet, RefreshCw, Zap, Database } from 'lucide-react';
import { usePepuPrice } from '@/hooks/usePepuPrice';

export async function notifyTopUp(
  cardCode: string,
  amountInUSD: number,
  walletAddress: string,
  txHash: string,
  userFirstName: string,
  userLastName: string,
  userEmail: string
) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram not configured');
    return;
  }

  const message = `💰 Card Top-Up Received

Card: ${cardCode}
Amount: $${amountInUSD}
User: ${userFirstName} ${userLastName}
Email: ${userEmail}
Wallet: ${walletAddress}
TX: ${txHash}`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
}

interface TopUpFormProps {
  onSuccess: () => void;
  cardCode: string;
  walletAddress: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
}

interface FormData {
  amount: string;
}

export function TopUpForm({ 
  onSuccess, 
  cardCode, 
  walletAddress,
  userFirstName,
  userLastName,
  userEmail
}: TopUpFormProps) {
  const { register, handleSubmit, watch, reset } = useForm<FormData>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: sendTxHash, sendTransaction } = useSendTransaction();
  
  const { data: pepuPrice } = usePepuPrice();

  const { isSuccess: isTxSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: sendTxHash,
  });

  const amount = watch('amount');
  const pepuNeeded = pepuPrice && amount 
    ? ((parseFloat(amount) * 1.05) / pepuPrice).toFixed(0)
    : '0';

  const onSubmit = async (data: FormData) => {
    const usdAmount = parseFloat(data.amount);
    
    if (usdAmount < 10) {
      toast.error('Minimum top-up amount is $10');
      return;
    }

    if (!pepuPrice) {
      toast.error('Unable to fetch PEPU price. Please try again.');
      return;
    }

    try {
      setIsProcessing(true);
      
      sendTransaction({
        to: import.meta.env.VITE_TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(pepuNeeded),
      });
    } catch (error) {
      toast.error('Payment failed: ' + (error as Error).message);
      setIsProcessing(false);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (isTxSuccess && sendTxHash && isProcessing) {
      (async () => {
        try {
          const usdAmount = parseFloat(amount);
          // Pass user details to the notification function
          await notifyTopUp(
            cardCode, 
            usdAmount, 
            walletAddress, 
            sendTxHash,
            userFirstName,
            userLastName,
            userEmail
          );
          toast.success(`Top-up successful! $${usdAmount.toFixed(2)} sent. Card will be funded shortly.`);
          reset();
          onSuccess();
        } catch (error) {
          toast.error('Failed to process top-up notification: ' + (error as Error).message);
        } finally {
          setIsProcessing(false);
        }
      })();
    }
  }, [isTxSuccess, sendTxHash, isProcessing, amount, cardCode, walletAddress, userFirstName, userLastName, userEmail, onSuccess, reset]);

  // Handle transaction error
  useEffect(() => {
    if (isTxError && isProcessing) {
      toast.error('Transaction failed on blockchain. Please check your wallet.');
      setIsProcessing(false);
    }
  }, [isTxError, isProcessing]);

  return (
    <Card className="bg-gray-900/50 border-cyan-500/20 backdrop-blur-sm shadow-xl">
      <div className="p-6 border-b border-cyan-500/20">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-cyan-300">
          <div className="p-2 rounded-full bg-cyan-900/50 border border-cyan-500/30">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="font-mono">Top Up Card</span>
        </h2>
        <p className="text-sm text-cyan-500/70 font-mono">Add funds to your virtual card</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-cyan-300/70 font-mono">Amount (USD)</label>
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              min="10"
              placeholder="Minimum $10"
              {...register('amount', { required: true, min: 10 })}
              className="bg-gray-800/50 border-cyan-500/30 focus:border-cyan-500 py-6 text-lg pl-12 font-mono"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500/70 font-mono">$</div>
          </div>
          {amount && pepuPrice && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
              <Database className="w-5 h-5 text-cyan-500/70" />
              <p className="text-sm text-cyan-300/70 font-mono">
                ≈ {pepuNeeded} PEPU (includes 5% network fee)
              </p>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isProcessing || !amount || parseFloat(amount) < 10}
          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white py-6 text-lg font-semibold font-mono border border-cyan-500/30"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing on Blockchain...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Wallet className="w-5 h-5" />
              Pay with Wallet
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}