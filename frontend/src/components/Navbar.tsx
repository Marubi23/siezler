import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMpesa } from '../context/MpesaContext';  // Changed
import { AddMpesaModal } from './AddMpesaModal';
import { Smartphone, User, LogOut } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useMpesa();  // Changed
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbarContainer">
          <Link to="/" className="navbarLogo">
            <img 
              src="/images/nego-safe.JPG" 
              alt="NegoSafe"
              className="logoImage"
            />
          </Link>

          <div className="navLinks">
            <Link 
              to="/" 
              className={`navLink ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className={`navLink ${location.pathname === '/create' ? 'active' : ''}`}
            >
              Create Transaction
            </Link>
            <Link 
              to="/my-transactions" 
              className={`navLink ${location.pathname === '/my-transactions' ? 'active' : ''}`}
            >
              My Transactions
            </Link>
          </div>

          {!user ? (
            <Link to="/create">
            <button  className="walletButton" >
              <Smartphone size={18} />
              Add M-Pesa Account
            </button>
            </Link>
          ) : (
            <div className="walletConnected">
              <div className="wallet-info">
                <Smartphone size={14} />
                <span className="walletAddress">
                  {user.phoneNumber.slice(-9)}
                </span>
              </div>
              <div className="wallet-name">
                <User size={12} />
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button onClick={logout} className="walletDisconnect" title="Logout">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </nav>

      <AddMpesaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};