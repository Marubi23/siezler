import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

export const NotFound: React.FC = () => {
  return (
    <div className="notfound">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <div className="notfound-divider"></div>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="notfound-buttons">
          <Link to="/" className="notfound-btn notfound-btn-primary">
            <Home size={18} />
            Back to Home
          </Link>
          <button onClick={() => window.history.back()} className="notfound-btn notfound-btn-secondary">
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};