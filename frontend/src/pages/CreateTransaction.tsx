import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMpesa } from '../context/MpesaContext';
import { FileUpload } from '../components/FileUpload';
import { AddMpesaModal } from '../components/AddMpesaModal';
import {WalletDashboard} from '../components/walletDashboard'; // Fixed: default import, capital W
import { Smartphone, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './CreateTransaction.css';

// Icons for connect screen - fixed to accept className
const CreditCard = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const Globe = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const Shield = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CreateTransaction: React.FC = () => {
  const { user } = useMpesa();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [fileHash, setFileHash] = useState('');
  const [aiReport, setAiReport] = useState<any>(null);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadComplete = (hash: string, report: any) => {
    setFileHash(hash);
    setAiReport(report);
    setStep(2);
    toast.success('File uploaded and verified!');
  };

  const handleCreateTransaction = async () => {
    if (!user) {
      toast.error('Please add your M-Pesa account first');
      return;
    }

    if (!buyerPhone) {
      toast.error('Please enter buyer phone number');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      let formattedPhone = buyerPhone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
      }

      const response = await fetch('http://localhost:5000/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerPhone: user.phoneNumber,
          sellerName: user.name,
          buyerPhone: formattedPhone,
          amount: parseFloat(amount),
          fileHash,
          aiReport,
          paymentMethod: 'mpesa'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Transaction created! Sending payment request to buyer...');
        
        const paymentResponse = await fetch('http://localhost:5000/api/mpesa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: data.transactionId,
            amount: parseFloat(amount),
            phoneNumber: formattedPhone,
            accountReference: `NEGOSAFE-${data.transactionId.slice(0, 8)}`
          })
        });

        if (paymentResponse.ok) {
          toast.success('Payment request sent! Buyer check your phone and enter PIN');
        }
        
        navigate(`/transaction/${data.transactionId}`);
      } else {
        toast.error(data.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show add M-Pesa account screen if no user
  if (!user) {
    return (
      <>
        <div className="create-transaction-container">
          <div className="bank-connect-card">
            <div className="bank-header">
              <Link to="/" className="navbarLogo">
                <img 
                  src="/images/nego-safe.JPG" 
                  alt="NegoSafe"
                  className="logoImage"
                />
              </Link>
            </div>
            
            <div className="connection-options">
              <div className="option-card" onClick={() => setIsModalOpen(true)}>
                <Smartphone size={32} className="option-icon" />
                <h3>Link M-Pesa</h3>
                <p>Connect your mobile money account</p>
                <span className="option-badge">Recommended</span>
              </div>
              
              <div className="option-card disabled">
                <CreditCard size={32} className="option-icon" />
                <h3>Bank Account</h3>
                <p>Coming soon</p>
              </div>
              
              <div className="option-card disabled">
                <Globe size={32} className="option-icon" />
                <h3>Crypto Wallet</h3>
                <p>Coming soon</p>
              </div>
            </div>
            
            <div className="security-note">
              <Shield size={16} className="security-icon" />
              <span>Your money is protected by bank-grade encryption</span>
            </div>
          </div>
        </div>
        
        <AddMpesaModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <>
      <div className="create-transaction-container">
        <WalletDashboard userId={user.id} phoneNumber={user.phoneNumber} />
        
        <div className="create-transaction-card">
          <h1 className="page-title">Create New Transaction</h1>
          
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Upload File</div>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Transaction Details</div>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Review & Create</div>
            </div>
          </div>

          {step === 1 && (
            <div className="step-content">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
          )}

          {step === 2 && aiReport && (
            <div className="step-content">
              <div className="ai-report-summary">
                <h3>AI Verification Report</h3>
                <div className="report-grid">
                  <div className="report-item">
                    <span className="label">File Type:</span>
                    <span className="value">{aiReport.fileType}</span>
                  </div>
                  <div className="report-item">
                    <span className="label">Word Count:</span>
                    <span className="value">{aiReport.wordCount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="report-item">
                    <span className="label">Risk Score:</span>
                    <span className={`value ${aiReport.riskScore > 50 ? 'high-risk' : 'low-risk'}`}>
                      {aiReport.riskScore}/100
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="label">Suggested Price:</span>
                    <span className="value suggested-price">
                      KES {aiReport.suggestedPrice ? (aiReport.suggestedPrice * 130).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="buyer-details-section">
                <h3>Buyer Information</h3>
                
                <div className="input-group">
                  <label>Buyer M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="0712345678"
                    className="form-input"
                  />
                  <p className="input-hint">
                    They'll receive a payment request on this number
                  </p>
                </div>

                <div className="input-group">
                  <label>Amount (KES)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 5000"
                    step="100"
                    className="form-input"
                  />
                  {aiReport?.suggestedPrice && (
                    <p className="input-hint">
                      Suggested: KES {(aiReport.suggestedPrice * 130).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn-primary" onClick={() => setStep(3)}>
                  Review Transaction
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Review Transaction Details</h3>
              
              <div className="review-section">
                <div className="review-item">
                  <span className="label">Seller:</span>
                  <span className="value">{user.name} ({user.phoneNumber.slice(-9)})</span>
                </div>
                <div className="review-item">
                  <span className="label">Buyer:</span>
                  <span className="value">{buyerPhone}</span>
                </div>
                <div className="review-item">
                  <span className="label">Amount:</span>
                  <span className="value amount">KES {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="review-item">
                  <span className="label">Platform Fee (1%):</span>
                  <span className="value">KES {(parseFloat(amount) * 0.01).toLocaleString()}</span>
                </div>
                <div className="review-item total">
                  <span className="label">Buyer Pays:</span>
                  <span className="value amount">
                    KES {(parseFloat(amount) * 1.01).toLocaleString()}
                  </span>
                </div>
                <div className="review-item">
                  <span className="label">You Receive:</span>
                  <span className="value amount">
                    KES {parseFloat(amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="info-box">
                <AlertCircle size={16} />
                <span>
                  Buyer will receive an STK Push on their phone. They must enter their PIN to complete payment.
                </span>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleCreateTransaction}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Create Transaction'}
                  {!isProcessing && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddMpesaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default CreateTransaction;