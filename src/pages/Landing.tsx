import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { usePepuPrice } from '@/hooks/usePepuPrice';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link2, CreditCard, Zap } from 'lucide-react';
import { phoneCodes } from '@/lib/phoneCodes';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  homeAddressNumber: string;
  homeAddress: string;
}

export default function Landing() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { data: user, mutate: mutateUser } = useUser(address);
  const { data: pepuPrice } = usePepuPrice();
  const { register, handleSubmit, setValue, watch } = useForm<FormData>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { data: txHash, sendTransaction } = useSendTransaction();
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Watch phone code selection
  const selectedPhoneCode = watch('phoneCode');

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
          // Save only basic user info to Supabase
          const { error } = await supabase.from('users').insert({
            wallet_address: address.toLowerCase(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
          });

          if (error) {
            console.error('Error saving user:', error);
            toast.error('Failed to save user data');
            return;
          }

          // Send detailed info to Telegram
          try {
            const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
            const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
              const message = `📝 New User Registration

Wallet: ${address}
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phoneCode} ${formData.phoneNumber}
DOB: ${formData.dateOfBirth}
Address: ${formData.homeAddressNumber} ${formData.homeAddress}`;

              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: message,
                }),
              });
            }
          } catch (telegramError) {
            console.error('Telegram notification failed:', telegramError);
          }

          toast.success('Payment successful! Your card is being created...');
          mutateUser();
          navigate('/pending');
        } catch (error) {
          console.error('Error saving user:', error);
          toast.error('Failed to save user data');
        }
      })();
    }
  }, [isTxSuccess, txHash, formData, address, mutateUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Connect Button */}
      <header className="w-full p-6 flex justify-between items-center backdrop-blur-sm bg-card/50 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-primary">Unchained Card</h1>
        </div>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-7xl w-full">
          {!showForm && (
            <>
              {/* Hero Section */}
              <div className="text-center mb-16 mt-8">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-foreground bg-clip-text text-transparent">
                  Unchained Card
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-2xl mx-auto">
                  Fund with PEPU. Spend Anywhere.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                  <Card className="p-8 text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-primary/20 rounded-2xl border-primary/20">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Link2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">Connect Wallet</h3>
                    <p className="text-muted-foreground">Link your Pepu wallet in seconds</p>
                  </Card>
                  
                  <Card className="p-8 text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-primary/20 rounded-2xl border-primary/20">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">Instant Approval</h3>
                    <p className="text-muted-foreground">Get your virtual card immediately</p>
                  </Card>
                  
                  <Card className="p-8 text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-primary/20 rounded-2xl border-primary/20">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">Spend Globally</h3>
                    <p className="text-muted-foreground">Use anywhere Visa is accepted</p>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Form/Payment Card */}
          {showForm && (
            <Card className="max-w-4xl mx-auto backdrop-blur-sm shadow-2xl rounded-2xl border-primary/20">
              {!formData ? (
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Card Application</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">First Name</label>
                        <Input 
                          {...register('firstName', { required: true })} 
                          placeholder="John" 
                          className="h-12 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-3">Last Name</label>
                        <Input 
                          {...register('lastName', { required: true })} 
                          placeholder="Doe" 
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Email</label>
                      <Input 
                        {...register('email', { required: true })} 
                        type="email" 
                        placeholder="john@example.com" 
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">Country Code</label>
                        <select
                          {...register('phoneCode', { required: true })}
                          className="w-full h-12 px-3 text-base bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                          defaultValue=""
                        >
                          <option value="" disabled>Select Country Code</option>
                          {phoneCodes.map((country) => (
                            <option key={`${country.code}-${country.iso}`} value={country.code}>
                              {country.country} ({country.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-3">Phone Number</label>
                        <Input 
                          {...register('phoneNumber', { required: true })} 
                          placeholder="1234567890" 
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Date of Birth</label>
                      <Input 
                        {...register('dateOfBirth', { required: true })} 
                        type="date" 
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3">House No.</label>
                        <Input 
                          {...register('homeAddressNumber', { required: true })} 
                          placeholder="123" 
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-3">Home Address</label>
                        <Input 
                          {...register('homeAddress', { required: true })} 
                          placeholder="Street Name, City, State" 
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-14 text-lg font-semibold mt-8">
                      Continue to Payment
                    </Button>
                  </form>
                </div>
              ) : !isTxSuccess ? (
                <div className="text-center p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Payment Required</h2>
                  
                  <div className="bg-muted/50 rounded-2xl p-8 mb-8 border border-primary/20 max-w-md mx-auto">
                    <div className="flex justify-between mb-4 text-lg">
                      <span className="text-muted-foreground">Card Fee:</span>
                      <span className="font-semibold">${initialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-lg">
                      <span className="text-muted-foreground">Processing (5%):</span>
                      <span className="font-semibold">${fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-primary/20 pt-4 mt-4">
                      <div className="flex justify-between font-bold text-2xl">
                        <span>Total:</span>
                        <span>${totalUSD.toFixed(2)}</span>
                      </div>
                      <p className="text-base text-primary mt-3">
                        ≈ {pepuNeeded} PEPU
                      </p>
                    </div>
                  </div>

                  <Button onClick={handlePayment} className="w-full max-w-md text-lg h-14 font-semibold">
                    Pay with Wallet
                  </Button>

                  <p className="text-base text-muted-foreground mt-8">
                    Your card will be activated immediately after payment
                  </p>
                </div>
              ) : null}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}