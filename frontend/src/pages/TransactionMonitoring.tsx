import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { DollarSign } from 'lucide-react';

const TransactionMonitoring: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get('/admin/transactions');
        setTransactions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in mt-16">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <h2 className="text-3xl font-bold flex items-center"><DollarSign className="mr-2" /> Financial Transactions</h2>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-textSecondary text-sm uppercase tracking-wide">
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">User / Phone</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-textSecondary animate-pulse">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-textSecondary">No transactions recorded.</td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm">{tx.transactionId}</td>
                    <td className="p-4 text-sm text-textSecondary">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="font-semibold">{tx.user?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-textSecondary">{tx.phoneNumber || tx.user?.email}</div>
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      KES {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitoring;
