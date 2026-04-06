import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import toast from 'react-hot-toast';

export const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock transaction data - replace with actual API call
    const mockTransaction = {
      id,
      seller: '0x1234...5678',
      buyer: '0x8765...4321',
      amount: 0.1,
      status: 'PAYMENT_DEPOSITED',
      fileHash: 'QmExample...',
      aiReport: {
        fileType: 'pdf',
        wordCount: 1500,
        riskScore: 15,
        keywords: ['contract', 'agreement', 'terms']
      },
      createdAt: new Date().toISOString()
    };
    
    setTransaction(mockTransaction);
    setLoading(false);
  }, [id]);

  const handleConfirmReceipt = () => {
    toast.success('Receipt confirmed! Funds released to seller.');
    navigate('/my-transactions');
  };

  const handleDispute = () => {
    toast.error('Dispute filed. Awaiting arbitration.');
  };

  if (loading) {
    return <div className="text-center py-12">Loading transaction...</div>;
  }

  if (!transaction) {
    return <div className="text-center py-12">Transaction not found</div>;
  }

  const isBuyer = account?.toLowerCase() === transaction.buyer?.toLowerCase();
  const isSeller = account?.toLowerCase() === transaction.seller?.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transaction Details</h1>
      
      {/* Status Badge */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Transaction ID:</span>
          <span className="font-mono text-sm">{transaction.id}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
            transaction.status === 'PAYMENT_DEPOSITED' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {transaction.status}
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold">{transaction.amount} ETH</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">File Hash:</span>
          <span className="font-mono text-sm truncate max-w-[200px]">{transaction.fileHash}</span>
        </div>
      </div>

      {/* AI Report */}
      {transaction.aiReport && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AI Verification Report</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">File Type:</span>
              <span>{transaction.aiReport.fileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Word Count:</span>
              <span>{transaction.aiReport.wordCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Score:</span>
              <span className={transaction.aiReport.riskScore > 50 ? 'text-red-600' : 'text-green-600'}>
                {transaction.aiReport.riskScore}/100
              </span>
            </div>
            <div>
              <span className="text-gray-600 block mb-2">Keywords:</span>
              <div className="flex flex-wrap gap-2">
                {transaction.aiReport.keywords.map((keyword: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-y-3">
          {isBuyer && transaction.status === 'KEY_DELIVERED' && (
            <button
              onClick={handleConfirmReceipt}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Confirm Receipt & Release Funds
            </button>
          )}
          
          {isBuyer && transaction.status === 'PAYMENT_DEPOSITED' && (
            <button
              onClick={handleDispute}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              File Dispute
            </button>
          )}
          
          {isSeller && transaction.status === 'PAYMENT_DEPOSITED' && (
            <button
              onClick={() => toast.success('Key delivered to buyer')}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
            >
              Deliver Decryption Key
            </button>
          )}
          
          <button
            onClick={() => navigate('/my-transactions')}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
          >
            Back to My Transactions
          </button>
        </div>
      </div>
    </div>
  );
};