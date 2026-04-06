import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MpesaProvider } from './context/MpesaContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import CreateTransaction from './pages/CreateTransaction';  // ← Removed curly braces
import { TransactionDetails } from './pages/TransactionDetails';
import { MyTransactions } from './pages/MyTransactions';
import { LearnMore } from './pages/LearnMore';
import { NotFound } from './pages/NotFound';
import './App.css';

function App() {
  return (
    <MpesaProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateTransaction />} />
              <Route path="/transaction/:id" element={<TransactionDetails />} />
              <Route path="/my-transactions" element={<MyTransactions />} />
              <Route path="/learn-more" element={<LearnMore />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </MpesaProvider>
  );
}

export default App;