import axios from 'axios';

// Get OAuth Token
export async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to get M-Pesa token');
  }
}

// Initiate STK Push for Top-Up
export async function initiateSTKPush(params: {
  amount: number;
  phoneNumber: string;
  transactionId: string;
  accountReference: string;
}): Promise<any> {
  try {
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
    
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const data = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: params.amount,
      PartyA: params.phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: params.phoneNumber,
      CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/topup-callback/${params.transactionId}`,
      AccountReference: params.accountReference,
      TransactionDesc: 'Wallet Top Up',
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('STK Push error:', error);
    throw new Error('Failed to initiate payment');
  }
}

// Query STK Push Status
export async function querySTKStatus(checkoutRequestId: string): Promise<any> {
  try {
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
    
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const data = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Query status error:', error);
    throw new Error('Failed to query payment status');
  }
}

// Mock balance for development (remove in production)
export async function getMockBalance(phoneNumber: string) {
  return {
    success: true,
    balance: Math.floor(Math.random() * 50000) + 1000,
    currency: 'KES',
    phoneNumber: phoneNumber,
    lastUpdated: new Date().toISOString(),
  };
}