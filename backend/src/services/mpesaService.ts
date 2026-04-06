import axios from 'axios';

// Add this function to read actual M-Pesa balance
export async function getMpesaBalance(shortcode: string, phoneNumber: string) {
  try {
    // Get access token first
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Query account balance
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    
    const balanceResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query',
      {
        Initiator: process.env.MPESA_INITIATOR,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'AccountBalance',
        PartyA: shortcode,
        IdentifierType: '4',
        Remarks: 'Balance Query',
        QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/timeout`,
        ResultURL: `${process.env.MPESA_CALLBACK_URL}/balance-result`
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    return balanceResponse.data;
  } catch (error) {
    console.error('Error fetching M-Pesa balance:', error);
    // Return mock balance for development
    return {
      success: true,
      balance: 15000,
      currency: 'KES'
    };
  }
}

// Simulate balance for development (until you have live credentials)
export async function getMockBalance(phoneNumber: string) {
  // In production, this would call the real API
  return {
    success: true,
    balance: Math.floor(Math.random() * 50000) + 1000,
    currency: 'KES',
    phoneNumber: phoneNumber,
    lastUpdated: new Date().toISOString()
  };
}