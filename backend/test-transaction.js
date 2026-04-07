// Save as test-transaction.js in your backend folder
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTestTransaction() {
  // First, find a wallet ID from your database
  const wallet = await prisma.wallet.findFirst();
  
  if (!wallet) {
    console.log('No wallet found. Create a user/wallet first');
    return;
  }

  const checkoutRequestId = `ws_CO_${Date.now()}`;
  
  const transaction = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: 1000,
      type: 'credit',
      status: 'pending',
      description: checkoutRequestId,
    },
  });
  
  console.log('Test transaction created:', {
    id: transaction.id,
    checkoutRequestId: checkoutRequestId,
    walletId: wallet.id
  });
}

createTestTransaction();