import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Create a new transaction
router.post('/create', async (req, res) => {
  try {
    const {
      sellerPhone,
      sellerName,
      buyerPhone,
      amount,
      fileHash,
      aiReport,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!sellerPhone || !buyerPhone || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find or create seller
    let seller = await prisma.user.findUnique({
      where: { phoneNumber: sellerPhone }
    });
    
    if (!seller) {
      seller = await prisma.user.create({
        data: {
          phoneNumber: sellerPhone,
          name: sellerName || `Seller ${sellerPhone.slice(-4)}`,
          isVerified: false
        }
      });
    }
    
    // Find or create buyer
    let buyer = await prisma.user.findUnique({
      where: { phoneNumber: buyerPhone }
    });
    
    if (!buyer) {
      buyer = await prisma.user.create({
        data: {
          phoneNumber: buyerPhone,
          name: `Buyer ${buyerPhone.slice(-4)}`,
          isVerified: false
        }
      });
    }
    
    // Generate transaction reference
    const transactionRef = `NEGO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        transactionRef,
        sellerId: seller.id,
        buyerId: buyer.id,
        sellerPhone,
        buyerPhone,
        sellerName: sellerName || seller.name,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'mpesa',
        fileHash: fileHash || null,
        aiReport: aiReport ? JSON.stringify(aiReport) : null,
        status: 'PENDING_PAYMENT'
      }
    });
    
    res.status(201).json({
      success: true,
      transactionId: transaction.id,
      transactionRef: transaction.transactionRef,
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        seller: true,
        buyer: true
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Fetch transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Update transaction status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, mpesaReceiptNumber, checkoutRequestId } = req.body;
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (mpesaReceiptNumber) updateData.mpesaReceiptNumber = mpesaReceiptNumber;
    if (checkoutRequestId) updateData.checkoutRequestId = checkoutRequestId;
    if (status === 'COMPLETED') updateData.completedAt = new Date();
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData
    });
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Get user's transactions
router.get('/user/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { phoneNumber: phone },
      include: {
        transactionsAsSeller: true,
        transactionsAsBuyer: true
      }
    });
    
    if (!user) {
      return res.json({ transactions: [] });
    }
    
    // Combine transactions with role
    const sellerTransactions = (user.transactionsAsSeller || []).map((tx: any) => ({
      ...tx,
      role: 'seller'
    }));
    
    const buyerTransactions = (user.transactionsAsBuyer || []).map((tx: any) => ({
      ...tx,
      role: 'buyer'
    }));
    
    const allTransactions = [...sellerTransactions, ...buyerTransactions];
    
    // Sort by creation date (newest first)
    const sortedTransactions = allTransactions.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json(sortedTransactions);
  } catch (error) {
    console.error('Fetch user transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    const transactions = await prisma.transaction.findMany({
      where: { status },
      include: {
        seller: true,
        buyer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Fetch by status error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Cancel transaction
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Transaction cancelled',
      transaction
    });
  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({ error: 'Failed to cancel transaction' });
  }
});

export default router;