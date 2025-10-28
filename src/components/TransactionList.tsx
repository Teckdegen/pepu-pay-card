import { Transaction } from '@/lib/cashwyre';
import { Card } from './ui/Card';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const getIcon = (drcr: 'DR' | 'CR') => {
    if (drcr === 'CR') {
      return <ArrowDownLeft className="w-5 h-5 text-primary" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-destructive" />;
  };

  const getAmountColor = (drcr: 'DR' | 'CR') => {
    return drcr === 'CR' ? 'text-primary' : 'text-destructive';
  };

  if (transactions.length === 0) {
    return (
      <Card className="text-center py-16 bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
        <div className="relative mx-auto mb-6">
          <RefreshCw className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <div className="absolute inset-0 w-16 h-16 mx-auto bg-muted/10 blur-xl rounded-full"></div>
        </div>
        <p className="text-muted-foreground text-lg">No transactions yet</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-foreground">Recent Transactions</h2>
      </div>
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {transactions.map((tx) => (
          <div
            key={tx.code}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gray-600/50">
                {getIcon(tx.drcr)}
              </div>
              <div>
                <p className="font-medium text-base">{tx.description}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(tx.createdOn), 'MMM dd, yyyy • HH:mm')}
                </p>
                <p className="text-xs text-muted-foreground capitalize mt-1">{tx.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${getAmountColor(tx.drcr)}`}>
                {tx.drcr === 'CR' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
              {tx.fee > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Fee: ${tx.fee.toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
