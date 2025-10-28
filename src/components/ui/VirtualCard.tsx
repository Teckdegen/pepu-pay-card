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
    <div className="relative w-full max-w-md mx-auto">
      <div 
        className="relative overflow-hidden rounded-2xl shadow-2xl w-full h-56 transform transition-transform hover:scale-105 duration-300"
        style={{
          backgroundImage: `url(${pepuCardImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 rounded-2xl" />
        
        {/* Card Content */}
        <div className="relative h-full flex flex-col justify-between p-6 text-white">
          {/* Top bar with chip and wifi */}
          <div className="flex justify-between items-center">
            <div className="w-10 h-8 rounded bg-gradient-to-r from-yellow-500 to-amber-400 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-amber-300 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              </div>
            </div>
            <Wifi className="w-6 h-6 rotate-90" />
          </div>

          {/* Balance */}
          <div>
            <p className="text-xs text-white/80 font-medium">Available Balance</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">${balance.toFixed(2)}</p>
          </div>

          {/* Card Number */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-mono tracking-wider">
                {formatCardNumber(cardNumber)}
              </p>
              <button
                onClick={() => setShowNumber(!showNumber)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={showNumber ? 'Hide card number' : 'Show card number'}
              >
                {showNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-white/70 mb-1">Cardholder</p>
                <p className="text-base font-semibold uppercase text-white">{cardholderName}</p>
              </div>
              
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-white/70 mb-1">Expires</p>
                  <p className="text-sm font-mono text-white">{expiryDate}</p>
                </div>
                
                <div>
                  <p className="text-xs text-white/70 mb-1">CVV</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-white">{showCVV ? cvv : '•••'}</p>
                    <button
                      onClick={() => setShowCVV(!showCVV)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      aria-label={showCVV ? 'Hide CVV' : 'Show CVV'}
                    >
                      {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card info footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Unchain Card • Virtual Debit Card
        </p>
      </div>
    </div>
  );
}