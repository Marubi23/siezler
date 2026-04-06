import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface MpesaUser {
  phoneNumber: string;
  name: string;
  isVerified: boolean;
}

interface MpesaContextType {
  user: MpesaUser | null;
  addMpesaAccount: (phoneNumber: string, name: string) => Promise<void>;
  logout: () => void;
  isConnecting: boolean;
}

const MpesaContext = createContext<MpesaContextType | undefined>(undefined);

export const useMpesa = () => {
  const context = useContext(MpesaContext);
  if (!context) {
    throw new Error('useMpesa must be used within MpesaProvider');
  }
  return context;
};

export const MpesaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MpesaUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load saved user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('negosafe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
const addMpesaAccount = async (phoneNumber: string, name: string) => {
  setIsConnecting(true);
  
  try {
    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // For testing: skip actual OTP API call
    // Just simulate success after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      phoneNumber: formattedPhone,
      name: name,
      isVerified: true
    };
    
    setUser(newUser);
    localStorage.setItem('negosafe_user', JSON.stringify(newUser));
    toast.success('M-Pesa account added successfully!');
    
  } catch (error) {
    console.error('Error adding M-Pesa account:', error);
    toast.error('Failed to add M-Pesa account');
    throw error;
  } finally {
    setIsConnecting(false);
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('negosafe_user');
    toast.success('Logged out successfully');
  };

  return (
    <MpesaContext.Provider value={{ user, addMpesaAccount, logout, isConnecting }}>
      {children}
    </MpesaContext.Provider>
  );
};