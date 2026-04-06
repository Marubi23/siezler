import React, { useState } from 'react';
import { useMpesa } from '../context/MpesaContext';
import { Smartphone, User, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddMpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMpesaModal: React.FC<AddMpesaModalProps> = ({ isOpen, onClose }) => {
  const { addMpesaAccount, isConnecting } = useMpesa();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addMpesaAccount(phoneNumber, name);
      onClose();
      // Reset form
      setPhoneNumber('');
      setName('');
      setStep('form');
      setOtp('');
    } catch (error) {
      // Error already handled in context
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add M-Pesa Account</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label>
              <User size={16} />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Smartphone size={16} />
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              required
            />
            <small>We'll send a verification code to this number</small>
          </div>

          <button type="submit" className="btn-add-mpesa" disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader size={18} className="spinner" />
                Verifying...
              </>
            ) : (
              <>
                <Smartphone size={18} />
                Add M-Pesa Account
              </>
            )}
          </button>
        </form>

        <div className="modal-footer">
          <p>Your number is safe with us. We only use it for payments.</p>
        </div>
      </div>
    </div>
  );
};