import prisma from '../lib/prisma';

// Get wallet balance for user
export async function getWalletBalance(userId: string) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });
    
    return {
      balance: wallet?.balance || 0,
      currency: 'KES',
      userId
    };
  } catch (error) {
    console.error('Wallet balance error:', error);
    return { balance: 0, currency: 'KES', userId };
  }
}

// Create wallet for new user
export async function createWallet(userId: string) {
  try {
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'KES'
      }
    });
    return wallet;
  } catch (error) {
    console.error('Create wallet error:', error);
    return null;
  }
}

// Update wallet balance
export async function updateWalletBalance(userId: string, amount: number, type: 'credit' | 'debit') {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    
    if (!wallet) {
      return null;
    }
    
    const newBalance = type === 'credit' 
      ? wallet.balance + amount 
      : wallet.balance - amount;
    
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { 
        balance: newBalance,
        updatedAt: new Date()
      }
    });
    
    // Create transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type,
        status: 'completed',
        description: type === 'credit' ? 'Deposit' : 'Withdrawal',
        balanceAfter: newBalance
      }
    });
    
    return updatedWallet;
  } catch (error) {
    console.error('Update wallet error:', error);
    return null;
  }
}