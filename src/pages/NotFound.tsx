import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <Card className="max-w-md w-full text-center p-12 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-2xl rounded-2xl">
        <div className="relative mx-auto mb-8">
          <AlertCircle className="w-20 h-20 mx-auto text-destructive" />
          <div className="absolute inset-0 w-20 h-20 mx-auto bg-destructive/20 blur-xl rounded-full"></div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-10 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button 
          onClick={() => navigate('/')}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg px-8 mx-auto rounded-xl"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Button>
      </Card>
    </div>
  );
}