import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Smartphone, 
  FileCheck, 
  Lock, 
  Zap, 
  Clock, 
  CreditCard,
  CheckCircle,
  ArrowRight,
  Star,
  Headphones,
  Database,
  TrendingUp,
  Heart,
  Sparkles,
  Rocket,
  Infinity,
  Gem
} from 'lucide-react';
import './LearnMore.css';

export const LearnMore: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Refs for scroll animations
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Mouse move effect for 3D parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Shield, title: 'Smart Escrow Protection', description: 'AI-powered escrow that automatically releases funds only when conditions are met.', color: '#059669', delay: 0 },
    { icon: FileCheck, title: 'AI Verification', description: 'Advanced machine learning detects scams and verifies file authenticity before payment.', color: '#0D9488', delay: 0.1 },
    { icon: Smartphone, title: 'M-Pesa Integration', description: 'Seamless mobile money payments with instant STK push notifications.', color: '#10B981', delay: 0.2 },
    { icon: Lock, title: 'Quantum Security', description: 'Bank-grade encryption with multi-layer authentication protocols.', color: '#3B82F6', delay: 0.3 },
    { icon: Zap, title: 'Lightning Fast', description: 'Sub-second transaction finality with real-time settlement.', color: '#F59E0B', delay: 0.4 },
    { icon: Database, title: 'Decentralized Storage', description: 'IPFS-powered permanent storage with cryptographic verification.', color: '#8B5CF6', delay: 0.5 }
  ];

  const steps = [
    { number: '01', title: 'Initiate', description: 'Create escrow', icon: Rocket, details: 'Seller uploads file, AI generates instant verification report' },
    { number: '02', title: 'Secure', description: 'Deposit funds', icon: Shield, details: 'Buyer reviews AI report and deposits funds into escrow' },
    { number: '03', title: 'Verify', description: 'AI check', icon: FileCheck, details: 'Multiple verification layers ensure file authenticity' },
    { number: '04', title: 'Release', description: 'Auto-payout', icon: TrendingUp, details: 'Funds automatically released to seller upon confirmation' }
  ];

  const stats = [
    { value: '100%', label: 'Success Rate', icon: Shield, suffix: '' },
    { value: '< 1', label: 'Minute Verification', icon: Zap, suffix: 'min' },
    { value: '50K+', label: 'Transactions', icon: TrendingUp, suffix: '+' },
    { value: '24/7', label: 'Support', icon: Headphones, suffix: '' }
  ];
const testimonials = [
  {
    name: 'Maria wa Mbugua',
    role: 'Mother',
    initials: 'JM',
    content: 'NegoSafe transformed how I sell digital products. The AI verification gives my buyers confidence, and M-Pesa integration makes payments seamless. I\'ve completed over 50 transactions without any issues!',
    image: '/images/testimonialA.JPG',
    delay: 0.1
  },
  {
    name: 'Mercy Cherono',
    role: 'Content Creator',
    initials: 'EM',
    content: 'As a content creator, getting paid safely was always a challenge until I found NegoSafe. The escrow system protects both me and my clients. The AI verification is a game-changer for the Kenyan digital economy!',
    image: '/images/testimonialB.JPG',
    delay: 0.2
  },
  {
    name: 'Kelsie Nyambura',
    role: 'Small Business Owner',
    initials: 'CN',
    content: 'NegoSafe is the platform Kenyan freelancers have been waiting for. The M-Pesa integration is seamless, and customer support responds within minutes. I highly recommend it to anyone selling digital products.',
    image: '/images/testimonialC.JPG',
    delay: 0.3
  }
];
  return (
    <div className="learnmore-container">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Hero Section with 3D Parallax */}
      <section className="learnmore-hero">
        <div className="hero-particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
        
        <div className="hero-glow orbs">
          <div className="glow-1" />
          <div className="glow-2" />
          <div className="glow-3" />
        </div>

        <div className="learnmore-hero-content" style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`
        }}>
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Next Generation Escrow</span>
          </div>
          <h1 className="learnmore-hero-title">
            The Future of
            <span className="gradient-text"> Secure Transactions</span>
          </h1>
          <p className="learnmore-hero-subtitle">
            NegoSafe combines AI verification with blockchain security to create the most trusted escrow platform in Africa.
          </p>
          <div className="learnmore-hero-buttons">
            <Link to="/create">
              <button className="btn-primary glow-button">
                <Rocket size={18} />
                Start Trading
                <ArrowRight size={16} className="btn-icon" />
              </button>
            </Link>
            <Link to="/">
              <button className="btn-outline">
                Watch Demo
                <Play size={16} />
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <div className="mouse">
            <div className="wheel" />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Floating Stats Cards */}
      <section className="floating-stats" ref={statsRef}>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card-glass animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-icon-wrapper">
                <stat.icon size={28} className="stat-icon" />
                <div className="stat-glow" />
              </div>
              <div className="stat-value">
                <span className="counter" data-target={stat.value}>{stat.value}</span>
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section className="features-section" ref={featuresRef}>
        <div className="section-header animate-on-scroll">
          <span className="section-badge">Why Choose Us</span>
          <h2>Powerful Features for <span className="gradient-text">Modern Escrow</span></h2>
          <p>Experience the next generation of digital transaction security</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card-3d animate-on-scroll" style={{ animationDelay: `${feature.delay}s` }}>
              <div className="feature-card-inner">
                <div className="feature-icon-3d" style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}cc)` }}>
                  <feature.icon size={28} color="white" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-hover-effect" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="timeline-section" ref={stepsRef}>
        <div className="section-header animate-on-scroll">
          <span className="section-badge">How It Works</span>
          <h2>Simple <span className="gradient-text">4-Step</span> Process</h2>
          <p>From initiation to completion in minutes</p>
        </div>
        <div className="timeline">
          {steps.map((step, index) => (
            <div key={index} className="timeline-item animate-on-scroll" style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="timeline-icon">
                <step.icon size={24} />
                <div className="timeline-number">{step.number}</div>
              </div>
              <div className="timeline-content">
                <h3>{step.title}</h3>
                <p className="timeline-description">{step.description}</p>
                <p className="timeline-details">{step.details}</p>
              </div>
              {index < steps.length - 1 && <div className="timeline-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Animated Benefits Carousel */}
      <section className="benefits-showcase">
        <div className="section-header animate-on-scroll">
          <span className="section-badge">Benefits</span>
          <h2>Why <span className="gradient-text">5,000+</span> Users Trust Us</h2>
        </div>
        <div className="benefits-marquee">
          <div className="benefits-track">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="benefit-pill">
                  <CheckCircle size={18} /> Zero Fraud Risk
                </div>
                <div className="benefit-pill">
                  <Clock size={18} /> Instant Settlement
                </div>
                <div className="benefit-pill">
                  <CreditCard size={18} /> Low 1% Fee
                </div>
                <div className="benefit-pill">
                  <Headphones size={18} /> 24/7 Support
                </div>
                <div className="benefit-pill">
                  <Gem size={18} /> Premium Security
                </div>
                <div className="benefit-pill">
                  <Infinity size={18} /> Unlimited Transactions
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Testimonial Cards */}
   <section className="testimonials-premium" ref={testimonialsRef}>
  <div className="section-header animate-on-scroll">
    <span className="section-badge">Testimonials</span>
    <h2>Trusted by <span className="gradient-text">Kenyans</span> Nationwide</h2>
  </div>
  <div className="testimonials-grid-3d">
    {testimonials.map((testimonial, index) => (
      <div key={index} className="testimonial-card-3d animate-on-scroll" style={{ animationDelay: `${testimonial.delay}s` }}>
        <div className="testimonial-card-inner">
          <div className="testimonial-quote">"</div>
          <p className="testimonial-text">
            {testimonial.content}
          </p>
          <div className="testimonial-author">
            <div className="author-avatar">
              {testimonial.image ? (
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="author-image" 
                />
              ) : (
                <div className="avatar-placeholder">{testimonial.initials}</div>
              )}
            </div>
            <div className="author-info">
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </div>
          </div>
  
        </div>
      </div>
    ))}
  </div>
</section>
      {/* CTA with Particle Effect */}
      <section className="cta-premium">
        <div className="cta-particle-bg">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="cta-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }} />
          ))}
        </div>
        <div className="cta-content-premium animate-on-scroll">
          <div className="cta-icon-wrapper">
            <Heart size={48} className="cta-heart" />
          </div>
          <h2>Ready to Experience<br /><span className="gradient-text">Secure Trading?</span></h2>
          <p>Join thousands of Kenyans who already trust NegoSafe for their digital transactions</p>
          <Link to="/create">
            <button className="cta-glow-button">
              Start Your First Transaction
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

// Play icon component (since it wasn't imported)
const Play: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);