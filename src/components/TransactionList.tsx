import { Transaction } from '@/lib/cashwyre';
import { Card } from './ui/card';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Database } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const getIcon = (drcr: 'DR' | 'CR') => {
    if (drcr === 'CR') {
      return <ArrowDownLeft className="w-5 h-5 text-cyan-400" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-rose-500" />;
  };

  const getAmountColor = (drcr: 'DR' | 'CR') => {
    return drcr === 'CR' ? 'text-cyan-400' : 'text-rose-500';
  };

  if (transactions.length === 0) {
    return (
      <Card className="text-center py-16 bg-gray-900/50 border-cyan-500/20 backdrop-blur-sm shadow-xl">
        <div className="relative mx-auto mb-6">
          <Database className="w-16 h-16 mx-auto text-cyan-500/30 mb-4" />
          <div className="absolute inset-0 w-16 h-16 mx-auto bg-cyan-500/10 blur-xl rounded-full"></div>
        </div>
        <h3 className="text-xl font-mono text-cyan-300 mb-2">No Transaction Data</h3>
        <p className="text-muted-foreground text-lg">Blockchain records are syncing...</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-cyan-500/20 backdrop-blur-sm shadow-xl">
      <div className="p-6 border-b border-cyan-500/20">
        <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
          <Database className="w-6 h-6" />
          <span className="font-mono">Transaction History</span>
        </h2>
        <p className="text-sm text-cyan-500/70 mt-1 font-mono">Real-time blockchain data</p>
      </div>
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {transactions.map((tx) => (
          <div
            key={tx.code}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-all duration-300 border border-cyan-500/10 hover:border-cyan-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-900/50 border border-cyan-500/30">
                {getIcon(tx.drcr)}
              </div>
              <div>
                <p className="font-medium text-base text-white">{tx.description}</p>
                <p className="text-sm text-cyan-500/70 font-mono">
                  {format(new Date(tx.createdOn), 'MMM dd, yyyy • HH:mm:ss')}
                </p>
                <p className="text-xs text-cyan-500/50 capitalize mt-1 font-mono">{tx.category} • {tx.code.slice(0, 8)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg font-mono ${getAmountColor(tx.drcr)}`}>
                {tx.drcr === 'CR' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
              {tx.fee > 0 && (
                <p className="text-xs text-cyan-500/50 mt-1 font-mono">Fee: ${tx.fee.toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}