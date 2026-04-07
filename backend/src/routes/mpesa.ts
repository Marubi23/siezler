import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// M-Pesa Callback for Top-Up
router.post('/topup-callback/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  const callbackData = req.body;

  console.log('Received M-Pesa callback:', JSON.stringify(callbackData, null, 2));

  try {
    const resultCode = callbackData.Body?.stkCallback?.ResultCode;
    const resultDesc = callbackData.Body?.stkCallback?.ResultDesc;
    const checkoutRequestId = callbackData.Body?.stkCallback?.CheckoutRequestID;
    const mpesaReceipt =
      callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
    const amount =
      callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(
        (item: any) => item.Name === 'Amount'
      )?.Value;

    // Find the pending transaction
    const pendingTx = await prisma.walletTransaction.findFirst({
      where: {
        description: { contains: checkoutRequestId },
        status: 'pending',
      },
      include: {
        wallet: true,
      },
    });

    if (!pendingTx) {
      console.log('Transaction not found for checkout ID:', checkoutRequestId);
      return res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    if (resultCode === 0) {
      // Payment successful
      const newBalance = pendingTx.wallet.balance + amount;

      // Update transaction status
      await prisma.walletTransaction.update({
        where: { id: pendingTx.id },
        data: {
          status: 'completed',
          description: `M-Pesa Top Up successful - Receipt: ${mpesaReceipt}`,
          balanceAfter: newBalance,
        },
      });

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: pendingTx.walletId },
        data: { balance: newBalance },
      });

      console.log(`✅ Top-up successful: KES ${amount} added to wallet ${pendingTx.walletId}`);
    } else {
      // Payment failed
      await prisma.walletTransaction.update({
        where: { id: pendingTx.id },
        data: {
          status: 'failed',
          description: `M-Pesa Top Up failed: ${resultDesc}`,
        },
      });

      console.log(`❌ Top-up failed: ${resultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
});

// Query payment status
router.post('/query-status', async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;
    const result = await querySTKStatus(checkoutRequestId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to query status' });
  }
});

export default router;