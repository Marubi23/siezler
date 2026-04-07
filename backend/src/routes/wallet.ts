import express from 'express';
import prisma from '../lib/prisma';
import { initiateSTKPush, querySTKStatus } from '../services/mpesaService';

const router = express.Router();

// Get wallet balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      balance: wallet?.balance || 0,
      currency: 'KES',
      userId,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
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
          take: 50,
        },
      },
    });

    res.json(wallet?.transactions || []);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Top up wallet - Initiate STK Push
router.post('/topup', async (req, res) => {
  try {
    const { userId, amount, phoneNumber } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({ error: 'Minimum top-up amount is KES 10' });
    }

    // Generate unique transaction reference
    const transactionRef = `TOPUP-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Create pending transaction record
    const pendingTransaction = await prisma.walletTransaction.create({
      data: {
        walletId: userId, // Note: You'll need to get actual walletId
        amount: parseFloat(amount),
        type: 'credit',
        status: 'pending',
        description: `M-Pesa Top Up - ${transactionRef}`,
        balanceAfter: 0,
      },
    });

    // Initiate STK Push
    const stkResult = await initiateSTKPush({
      amount: parseFloat(amount),
      phoneNumber: phoneNumber,
      transactionId: pendingTransaction.id,
      accountReference: transactionRef,
    });

    // Store checkout request ID
    await prisma.walletTransaction.update({
      where: { id: pendingTransaction.id },
      data: {
        description: `M-Pesa Top Up - ${transactionRef} - CheckoutID: ${stkResult.CheckoutRequestID}`,
      },
    });

    res.json({
      success: true,
      message: 'STK Push sent to your phone',
      checkoutRequestId: stkResult.CheckoutRequestID,
      transactionId: pendingTransaction.id,
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ error: 'Failed to initiate top-up' });
  }
});

// Withdraw from wallet
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, phoneNumber } = req.body;

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal record
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: parseFloat(amount),
        type: 'debit',
        status: 'pending',
        description: `Withdrawal to ${phoneNumber}`,
        balanceAfter: wallet.balance - amount,
      },
    });

    // Update wallet balance (pending)
    await prisma.wallet.update({
      where: { userId },
      data: { balance: wallet.balance - amount },
    });

    // TODO: Initiate B2C payment here

    res.json({
      success: true,
      message: 'Withdrawal initiated',
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

export default router;