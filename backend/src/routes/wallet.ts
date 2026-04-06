import express from 'express';
import prisma from '../lib/prisma';
import { getWalletBalance, updateWalletBalance } from '../services/walletService';

const router = express.Router();

// Get wallet balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const balance = await getWalletBalance(userId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Get transaction history
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
    
    res.json(wallet?.transactions || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Top up wallet from M-Pesa
router.post('/topup', async (req, res) => {
  try {
    const { userId, amount, phoneNumber } = req.body;
    
    // In production, initiate STK Push here
    // For now, simulate successful top-up
    
    const updatedWallet = await updateWalletBalance(userId, amount, 'credit');
    
    res.json({
      success: true,
      message: `KES ${amount} added to wallet`,
      balance: updatedWallet?.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Top-up failed' });
  }
});

// Withdraw from wallet to M-Pesa
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, phoneNumber } = req.body;
    
    const balance = await getWalletBalance(userId);
    
    if (balance.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // In production, initiate B2C payment here
    
    const updatedWallet = await updateWalletBalance(userId, amount, 'debit');
    
    res.json({
      success: true,
      message: `KES ${amount} withdrawn to ${phoneNumber}`,
      balance: updatedWallet?.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

export default router;