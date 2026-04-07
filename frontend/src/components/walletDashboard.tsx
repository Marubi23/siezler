import React, { useState, useEffect } from 'react';
import { Wallet, Smartphone, ArrowUp, ArrowDown, RefreshCw, Eye, EyeOff, TrendingUp, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import './WalletDashboard.css';

interface WalletDashboardProps {
  userId: string;
  phoneNumber: string;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ userId, phoneNumber }) => {
  const [balance, setBalance] = useState(0);
  const [mpesaBalance, setMpesaBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet balance
      const balanceRes = await fetch(`http://localhost:5000/api/wallet/balance/${userId}`);
      const balanceData = await balanceRes.json();
      setBalance(balanceData.balance);
      
      // Fetch M-Pesa balance (mock for now)
      const mpesaRes = await fetch(`http://localhost:5000/api/mpesa/balance/${phoneNumber}`);
      const mpesaData = await mpesaRes.json();
      setMpesaBalance(mpesaData.balance);
      
      // Fetch transactions
      const txRes = await fetch(`http://localhost:5000/api/wallet/transactions/${userId}`);
      const txData = await txRes.json();
      setTransactions(txData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (checkoutId: string, amountValue: number) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    const interval = setInterval(async () => {
      attempts++;
      console.log(`Polling payment status... Attempt ${attempts}`);

      try {
        const response = await fetch('http://localhost:5000/api/mpesa/query-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestId: checkoutId }),
        });

        const data = await response.json();

        if (data.ResultCode === 0) {
          // Payment successful
          clearInterval(interval);
          toast.success(`KES ${amountValue.toLocaleString()} added to your wallet!`);
          fetchWalletData(); // Refresh balance
          setShowTopUpModal(false);
          setAmount('');
          setCheckoutRequestId(null);
        } else if (data.ResultCode !== '1037') {
          // 1037 means pending, any other code means failure
          clearInterval(interval);
          toast.error(data.ResultDesc || 'Payment failed');
          setCheckoutRequestId(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        toast.error('Payment timeout. Please check your M-Pesa statement.');
        setCheckoutRequestId(null);
      }
    }, 2000);
  };

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 10) {
      toast.error('Minimum top-up amount is KES 10');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Initiating payment request...');

    try {
      const response = await fetch('http://localhost:5000/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          phoneNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('STK Push sent! Check your phone and enter your M-Pesa PIN', {
          duration: 5000,
        });
        
        // Store checkoutRequestId for polling
        setCheckoutRequestId(data.checkoutRequestId);
        
        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestId, parseFloat(amount));
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || 'Top-up failed');
      }
    } catch (error) {
      console.error('Top-up error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to initiate top-up');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Processing withdrawal...');

    try {
      const response = await fetch('http://localhost:5000/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          phoneNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(`KES ${amount} withdrawn to ${phoneNumber}!`);
        setShowWithdrawModal(false);
        setAmount('');
        fetchWalletData();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-KE');
  };

  useEffect(() => {
    fetchWalletData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWalletData, 30000);
    return () => clearInterval(interval);
  }, [userId, phoneNumber]);

  if (loading) {
    return (
      <div className="wallet-loading">
        <div className="spinner"></div>
        <p>Loading your wallet...</p>
      </div>
    );
  }

  return (
    <>
      <div className="wallet-dashboard">
        {/* Main Balance Card */}
        <div className="balance-card">
          <div className="balance-header">
            <div className="balance-title">
              <Wallet size={20} />
              <span>NegoSafe Wallet</span>
            </div>
            <button className="toggle-visibility" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="balance-amount">
            {showBalance ? formatCurrency(balance) : '••••••'}
          </div>
          
          <div className="balance-usd">
            ≈ ${showBalance ? (balance / 130).toFixed(2) : '••••••'} USD
          </div>
          
          <div className="balance-actions">
            <button className="action-btn topup" onClick={() => setShowTopUpModal(true)}>
              <ArrowUp size={16} />
              Top Up
            </button>
            <button className="action-btn withdraw" onClick={() => setShowWithdrawModal(true)}>
              <ArrowDown size={16} />
              Withdraw
            </button>
            <button className="action-btn refresh" onClick={fetchWalletData}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* M-Pesa Linked Account */}
        <div className="mpesa-card">
          <div className="mpesa-header">
            <Smartphone size={20} />
            <div className="mpesa-info">
              <span className="mpesa-label">Linked M-Pesa Account</span>
              <span className="mpesa-number">{phoneNumber}</span>
            </div>
            <div className="mpesa-badge">Verified</div>
          </div>
          
          <div className="mpesa-balance">
            <span className="label">Available Balance</span>
            <span className="value">{formatCurrency(mpesaBalance)}</span>
          </div>
          
          <div className="mpesa-note">
            <Shield size={12} />
            <span>Your M-Pesa is securely linked</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <TrendingUp size={20} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{transactions.length}</span>
              <span className="stat-label">Transactions</span>
            </div>
          </div>
          <div className="stat-card">
            <Clock size={20} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">0%</span>
              <span className="stat-label">Platform Fee</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <h3>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <p>No transactions yet</p>
              <button className="btn-outline-small" onClick={() => setShowTopUpModal(true)}>
                Make your first deposit
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className={`transaction-item ${tx.type}`}>
                  <div className="transaction-icon">
                    {tx.type === 'credit' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-description">{tx.description}</span>
                    <span className="transaction-date">{formatDate(tx.createdAt)}</span>
                  </div>
                  <div className={`transaction-amount ${tx.type}`}>
                    {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="modal-overlay" onClick={() => setShowTopUpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Top Up Wallet</h3>
              <button className="modal-close" onClick={() => setShowTopUpModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Enter amount to add to your wallet</p>
              <div className="amount-input-wrapper">
                <span className="currency">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
              <div className="quick-amounts">
                <button onClick={() => setAmount('500')}>KES 500</button>
                <button onClick={() => setAmount('1000')}>KES 1,000</button>
                <button onClick={() => setAmount('5000')}>KES 5,000</button>
                <button onClick={() => setAmount('10000')}>KES 10,000</button>
              </div>
              <p className="modal-note">
                You'll receive an STK Push on your phone to complete the payment
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTopUpModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleTopUp} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm Top Up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Withdraw to M-Pesa</h3>
              <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Enter amount to withdraw to {phoneNumber}</p>
              <div className="amount-input-wrapper">
                <span className="currency">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
              <div className="available-balance">
                Available: {formatCurrency(balance)}
              </div>
              <p className="modal-note">
                Funds will be sent to your linked M-Pesa account instantly
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleWithdraw} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletDashboard;