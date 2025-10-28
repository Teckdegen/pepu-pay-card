import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/Card';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';
import { usePepuPrice } from '@/hooks/usePepuPrice';
import { notifyTopUp } from '@/lib/api';

interface TopUpFormProps {
  onSuccess: () => void;
  cardCode: string;
  walletAddress: string;
}

interface FormData {
  amount: string;
}

export function TopUpForm({ onSuccess, cardCode, walletAddress }: TopUpFormProps) {
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
          await notifyTopUp(cardCode, usdAmount, walletAddress, sendTxHash);
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
  }, [isTxSuccess, sendTxHash, isProcessing]);

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        Top Up Card
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount (USD)</label>
          <Input
            type="number"
            step="0.01"
            min="10"
            placeholder="Minimum $10"
            {...register('amount', { required: true, min: 10 })}
          />
          {amount && pepuPrice && (
            <p className="text-sm text-muted-foreground mt-2">
              ≈ {pepuNeeded} PEPU (includes 5% fee)
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isProcessing || !amount || parseFloat(amount) < 10}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isProcessing ? 'Processing...' : `Pay with Wallet`}
        </Button>
      </form>
    </Card>
  );
}
