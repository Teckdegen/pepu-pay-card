import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <Card className="max-w-md w-full text-center p-12 bg-gray-800 border-gray-700">
        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button 
          onClick={() => navigate('/')}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Button>
      </Card>
    </div>
  );
}