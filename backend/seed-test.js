import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTestUserAndWallet() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        // Add other required fields based on your User model
      },
    });
    
    console.log('User created:', user);
    
    // Create wallet for the user
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });
    
    console.log('Wallet created:', wallet);
    
    // Now create a test transaction
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
      transactionId: transaction.id,
      checkoutRequestId: checkoutRequestId,
      walletId: wallet.id,
      amount: transaction.amount
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestUserAndWallet();