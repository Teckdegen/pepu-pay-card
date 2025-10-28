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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <Card className="max-w-md w-full text-center p-12 animate-pulse-glow bg-gray-800 border-gray-700">
        <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
        
        <h2 className="text-2xl font-bold mb-4">Creating Your Card</h2>
        
        <p className="text-muted-foreground mb-4">
          Your virtual card is being set up with Cashwyre...
        </p>

        <div className="flex justify-center gap-2">
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }}
          />
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          This usually takes less than a minute
        </p>
      </Card>
    </div>
  );
}
