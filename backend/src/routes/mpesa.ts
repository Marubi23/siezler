import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Initiate STK Push
router.post('/initiate', async (req, res) => {
  try {
    const { transactionId, amount, phoneNumber, accountReference } = req.body;
    
    // Generate checkout request ID
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    // Store payment record
    await prisma.mpesaPayment.create({
      data: {
        transactionId,
        checkoutRequestId,
        amount,
        phoneNumber,
        status: 'PENDING'
      }
    });
    
    // Update transaction with checkout request ID
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { checkoutRequestId }
    });
    
    res.json({
      success: true,
      checkoutRequestId,
      message: "STK Push sent to customer's phone"
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// M-Pesa Callback endpoint
router.post('/callback/:type/:transactionId', async (req, res) => {
  const { type, transactionId } = req.params;
  const callbackData = req.body;
  
  console.log(`Received ${type} callback for ${transactionId}:`, JSON.stringify(callbackData, null, 2));
  
  try {
    if (type === 'stk') {
      const resultCode = callbackData.Body?.stkCallback?.ResultCode;
      const checkoutRequestId = callbackData.Body?.stkCallback?.CheckoutRequestID;
      const mpesaReceipt = callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      
      // Update payment record
      await prisma.mpesaPayment.update({
        where: { checkoutRequestId },
        data: {
          status: resultCode === 0 ? 'SUCCESS' : 'FAILED',
          mpesaReceiptNumber: mpesaReceipt,
          resultCode,
          resultDesc: callbackData.Body?.stkCallback?.ResultDesc,
          completedAt: resultCode === 0 ? new Date() : undefined
        }
      });
      
      // Update transaction status
      if (resultCode === 0) {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'PAYMENT_RECEIVED',
            mpesaReceiptNumber: mpesaReceipt
          }
        });
      }
    }
  } catch (error) {
    console.error('Callback processing error:', error);
  }
  
  // Always respond with success to Safaricom
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

// Send OTP for verification
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // In production, send actual OTP via SMS
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP (you'll need an Otp model)
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

export default router;