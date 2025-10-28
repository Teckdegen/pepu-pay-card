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
      <Card className="text-center py-12">
        <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground">No transactions yet</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-foreground">Recent Transactions</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.map((tx) => (
          <div
            key={tx.code}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-background">
                {getIcon(tx.drcr)}
              </div>
              <div>
                <p className="font-medium text-sm">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tx.createdOn), 'MMM dd, yyyy • HH:mm')}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{tx.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${getAmountColor(tx.drcr)}`}>
                {tx.drcr === 'CR' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
              {tx.fee > 0 && (
                <p className="text-xs text-muted-foreground">Fee: ${tx.fee.toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
