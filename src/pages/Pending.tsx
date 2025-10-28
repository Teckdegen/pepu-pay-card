import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

export default function Pending() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { data: user } = useUser(address);

  useEffect(() => {
    if (!address) {
      navigate('/');
      return;
    }

    // Poll for card creation
    const interval = setInterval(async () => {
      if (user?.card_code) {
        navigate('/dashboard');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [address, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <Card className="max-w-md w-full text-center p-12 animate-pulse-glow bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-2xl rounded-2xl">
        <div className="relative mx-auto mb-8">
          <Loader2 className="w-20 h-20 mx-auto text-primary animate-spin" />
          <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/20 blur-xl rounded-full"></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Creating Your Card</h2>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Your virtual card is being set up with Cashwyre...
        </p>

        <div className="flex justify-center gap-3 mb-8">
          <div 
            className="w-4 h-4 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-4 h-4 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-4 h-4 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          This usually takes less than a minute
        </p>
      </Card>
    </div>
  );
}