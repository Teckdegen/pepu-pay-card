import { useState } from 'react';
import { Eye, EyeOff, Lock, Wifi } from 'lucide-react';
import { Card } from './Card';
import pepuCardImage from '@/assets/pepu-card.png';

interface VirtualCardProps {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  balance: number;
}

export function VirtualCard({ cardNumber, expiryDate, cvv, cardholderName, balance }: VirtualCardProps) {
  const [showCVV, setShowCVV] = useState(false);
  const [showNumber, setShowNumber] = useState(false);

  const formatCardNumber = (number: string) => {
    if (showNumber) {
      return number.match(/.{1,4}/g)?.join(' ') || number;
    }
    const last4 = number.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div 
        className="relative overflow-hidden rounded-3xl shadow-2xl w-full aspect-[1.586] transform transition-all duration-300 hover:scale-[1.01]"
        style={{
          backgroundImage: `url(${pepuCardImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Enhanced overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-primary/10 to-black/60 rounded-3xl" />
        
        {/* Card Content */}
        <div className="relative h-full flex flex-col justify-between p-8 text-white">
          {/* Top bar with chip and wifi */}
          <div className="flex justify-between items-center">
            <div className="w-14 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
              <div className="w-10 h-8 rounded-md bg-amber-300 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-amber-600"></div>
              </div>
            </div>
            <Wifi className="w-8 h-8 rotate-90 text-white/90" />
          </div>

          {/* Card Number */}
          <div className="flex items-center justify-between">
            <p className="text-2xl md:text-3xl font-mono tracking-widest">
              {formatCardNumber(cardNumber)}
            </p>
            <button
              onClick={() => setShowNumber(!showNumber)}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
              aria-label={showNumber ? 'Hide card number' : 'Show card number'}
            >
              {showNumber ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">Cardholder</p>
              <p className="text-lg md:text-xl font-semibold uppercase text-white tracking-wider">{cardholderName}</p>
              <div className="mt-4">
                <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">Balance</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">${balance.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">Expires</p>
                <p className="text-lg font-mono text-white tracking-wider">{expiryDate}</p>
              </div>
              
              <div>
                <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">CVV</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-white tracking-wider">{showCVV ? cvv : '•••'}</p>
                  <button
                    onClick={() => setShowCVV(!showCVV)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                    aria-label={showCVV ? 'Hide CVV' : 'Show CVV'}
                  >
                    {showCVV ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card info footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-widest">
          Unchain Card • Virtual Debit Card
        </p>
      </div>
    </div>
  );
}