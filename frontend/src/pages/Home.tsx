import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import { Shield, FileCheck, Lock, Zap, Award, Globe } from 'lucide-react';
import './Home.css';

export const Home: React.FC = () => {
  const { account } = useWeb3();

  const features = [
    { 
      icon: Shield, 
      title: 'Smart Contract Escrow', 
      description: 'Funds held securely in automated escrow until both parties confirm satisfaction' 
    },
    { 
      icon: FileCheck, 
      title: 'AI Verification', 
      description: 'Advanced AI analyzes files to prevent scams without revealing sensitive content' 
    },
    { 
      icon: Lock, 
      title: 'Multi-Stage Termination', 
      description: 'Ethical exit options at specific stages for both buyers and sellers' 
    },
    { 
      icon: Zap, 
      title: 'Lightning Fast', 
      description: 'Decentralized storage with IPFS for instant, censorship-resistant file access' 
    },
    { 
      icon: Award, 
      title: 'Reputation System', 
      description: 'Build trust with on-chain reputation scores for all participants' 
    },
    { 
      icon: Globe, 
      title: 'Cross-Chain Support', 
      description: 'Support for Ethereum, Polygon, Arbitrum, and more blockchains' 
    },
  ];

  const steps = [
    { number: '01', title: 'Upload & Verify', description: 'Seller uploads encrypted file, AI generates verification report' },
    { number: '02', title: 'Deposit Funds', description: 'Buyer reviews AI report and deposits funds into escrow' },
    { number: '03', title: 'Deliver Key', description: 'Seller provides decryption key after payment confirmation' },
    { number: '04', title: 'Complete', description: 'Buyer confirms receipt, funds automatically released to seller' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="heroSection">
        <div className="heroContent">
          <h1 className="heroTitle">
            Nego-Safe
          </h1>
          <p className="heroSubtitle">
            Secure Escrow Platform for Digital Documents with AI-Powered Verification
          </p>
          <div className="heroButtons">
            {!account ? (
              <Link to="/create">
              <button className="btn-primary">
                Connect Wallet to Start
              </button>
              </Link>
            ) : (
              <Link to="/create">
                <button className="btn-primary">
                  Create Transaction
                </button>
              </Link>
            )}
         <Link to="/learn-more">
  <button className="btn-outline">
    Learn More
  </button>
</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="featuresSection">
        <div className="sectionTitle">Powerful Features</div>
        <div className="sectionSubtitle">
          Everything you need for secure digital asset transactions
        </div>
        <div className="featuresGrid">
          {features.map((feature, index) => (
            <div key={index} className="featureCard">
              <feature.icon className="featureIcon" />
              <h3 className="featureTitle">{feature.title}</h3>
              <p className="featureDescription">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className="stepsSection">
        <div className="sectionTitle">How It Works</div>
        <div className="sectionSubtitle">
          Simple 4-step process to complete your transaction
        </div>
        <div className="stepsGrid">
          {steps.map((step, index) => (
            <div key={index} className="stepCard">
              <div className="stepNumber">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaSection">
        <div className="ctaTitle">Ready to Get Started?</div>
        <div className="ctaSubtitle">
          Join thousands of users who trust Nego-safe  for secure digital transactions
        </div>
        {!account ? (
          <Link to="/create">
          <button className="ctaButton">Connect Wallet Now</button>
        </Link>

        ) : (
          <Link to="/create">
            <button className="ctaButton">Create Your First Transaction</button>
          </Link>
        )}
      </section>
    </div>
  );
};