import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/Card';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { Wallet, RefreshCw } from 'lucide-react';
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

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
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
      toast.error('Unable to fetch PEPU price');
      return;
    }

    try {
      setIsProcessing(true);
      
      sendTransaction({
        to: import.meta.env.VITE_TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(pepuNeeded),
      });
    } catch (error) {
      toast.error('Payment failed');
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
          toast.error('Failed to process top-up notification');
        } finally {
          setIsProcessing(false);
        }
      })();
    }
  }, [isTxSuccess, sendTxHash, isProcessing, amount, cardCode, walletAddress, userFirstName, userLastName, userEmail, onSuccess, reset]);

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          Top Up Card
        </h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Amount (USD)</label>
          <Input
            type="number"
            step="0.01"
            min="10"
            placeholder="Minimum $10"
            {...register('amount', { required: true, min: 10 })}
            className="bg-gray-700/50 border-gray-600 focus:border-primary py-6 text-lg"
          />
          {amount && pepuPrice && (
            <p className="text-sm text-muted-foreground mt-3">
              ≈ {pepuNeeded} PEPU (includes 5% fee)
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isProcessing || !amount || parseFloat(amount) < 10}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay with Wallet`
          )}
        </Button>
      </form>
    </Card>
  );
}
