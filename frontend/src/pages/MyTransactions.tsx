import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';

interface Transaction {
  id: string;
  counterparty: string;
  amount: number;
  status: string;
  role: 'buyer' | 'seller';
  date: string;
}

export const MyTransactions: React.FC = () => {
  const { account } = useWeb3();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTransactions: Transaction[] = [
      {
        id: '0x1234...5678',
        counterparty: '0xabcd...efgh',
        amount: 0.1,
        status: 'COMPLETED',
        role: 'seller',
        date: new Date().toISOString()
      },
      {
        id: '0x8765...4321',
        counterparty: '0xijkl...mnop',
        amount: 0.05,
        status: 'PAYMENT_DEPOSITED',
        role: 'buyer',
        date: new Date().toISOString()
      }
    ];
    
    setTransactions(mockTransactions);
    setLoading(false);
  }, [account]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'PENDING_VERIFICATION': 'bg-gray-100 text-gray-800',
      'VERIFIED': 'bg-blue-100 text-blue-800',
      'PAYMENT_DEPOSITED': 'bg-yellow-100 text-yellow-800',
      'KEY_DELIVERED': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'TERMINATED': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please connect your wallet to view transactions</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading transactions...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Transactions</h1>
      
      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No transactions yet</p>
          <Link
            to="/create"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Create Your First Transaction
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Transaction ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Counterparty</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{tx.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tx.role === 'seller' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {tx.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{tx.counterparty.slice(0, 6)}...{tx.counterparty.slice(-4)}</td>
                  <td className="px-6 py-4 font-semibold">{tx.amount} ETH</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/transaction/${tx.id}`}
                      className="text-primary hover:text-primary-dark text-sm"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};