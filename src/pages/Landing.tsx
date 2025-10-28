import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { usePepuPrice } from '@/hooks/usePepuPrice';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/Card';
import { Link2, CreditCard, Zap } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  customerCode: string;
}

export default function Landing() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { data: user, mutate: mutateUser } = useUser(address);
  const { data: pepuPrice } = usePepuPrice();
  const { register, handleSubmit } = useForm<FormData>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { data: txHash, sendTransaction } = useSendTransaction();
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const initialCost = 30; // $30 initial card fee
  const fee = initialCost * 0.05; // 5% fee
  const totalUSD = initialCost + fee;
  const pepuNeeded = pepuPrice ? (totalUSD / pepuPrice).toFixed(0) : '0';

  // Check if user already has a card
  useEffect(() => {
    if (user?.card_code) {
      navigate('/dashboard');
    } else if (user && !user.card_code) {
      // User exists but no card yet
      navigate('/pending');
    }
  }, [user, navigate]);

  // Show form if connected and no user
  useEffect(() => {
    if (isConnected && !user) {
      setShowForm(true);
    }
  }, [isConnected, user]);

  const onSubmit = (data: FormData) => {
    setFormData(data);
  };

  const handlePayment = async () => {
    if (!formData || !address) {
      toast.error('Please fill out the form first');
      return;
    }

    try {
      sendTransaction({
        to: import.meta.env.VITE_TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(pepuNeeded),
      });
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  // Handle successful payment
  useEffect(() => {
    if (isTxSuccess && txHash && formData && address) {
      (async () => {
        try {
          // Save user to Supabase
          const { error } = await supabase.from('users').insert({
            wallet_address: address,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            customer_code: formData.customerCode,
          });

          if (error) throw error;

          toast.success('Payment successful! Your card is being created...');
          mutateUser();
          navigate('/pending');
        } catch (error) {
          console.error('Error saving user:', error);
          toast.error('Failed to save user data');
        }
      })();
    }
  }, [isTxSuccess, txHash, formData, address]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Pepu Card" 
                className="w-24 h-24 animate-float"
              />
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse-glow" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Pepu Card
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Fund with PEPU. Spend Anywhere.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <Card className="p-6 text-center hover:scale-105 transition-transform">
              <Link2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">Link your Pepu wallet in seconds</p>
            </Card>
            
            <Card className="p-6 text-center hover:scale-105 transition-transform">
              <Zap className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="font-bold mb-2">Instant Approval</h3>
              <p className="text-sm text-muted-foreground">Get your virtual card immediately</p>
            </Card>
            
            <Card className="p-6 text-center hover:scale-105 transition-transform">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Spend Globally</h3>
              <p className="text-sm text-muted-foreground">Use anywhere Visa is accepted</p>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-md mx-auto">
          {!isConnected ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Get Started</h2>
              <ConnectButton />
              <p className="text-sm text-muted-foreground mt-4">
                Connect your Pepu wallet to continue
              </p>
            </div>
          ) : showForm && !formData ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">Card Application</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input {...register('firstName', { required: true })} placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input {...register('lastName', { required: true })} placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input 
                    {...register('email', { required: true })} 
                    type="email" 
                    placeholder="john@example.com" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cashwyre Customer Code</label>
                  <Input 
                    {...register('customerCode', { required: true })} 
                    placeholder="Enter your customer code" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You must create a customer account at Cashwyre first
                  </p>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Continue to Payment
                </Button>
              </form>
            </div>
          ) : formData && !isTxSuccess ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Payment Required</h2>
              
              <div className="bg-muted rounded-lg p-6 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Card Fee:</span>
                  <span className="font-semibold">${initialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Processing (5%):</span>
                  <span className="font-semibold">${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${totalUSD.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ {pepuNeeded} PEPU
                  </p>
                </div>
              </div>

              <Button 
                onClick={handlePayment}
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
              >
                Pay with Wallet
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Your card will be activated immediately after payment
              </p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
