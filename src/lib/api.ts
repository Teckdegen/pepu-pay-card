// API client functions for interacting with Cashwyre and blockchain

export async function fetchPepuPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=pepe&vs_currencies=usd'
    );
    const data = await response.json();
    return data.pepe?.usd || 0.00001;
  } catch (error) {
    console.error('Price fetch error:', error);
    return 0.00001;
  }
}

export async function getCardBalance(cardCode: string, customerEmail: string) {
  const requestId = Math.random().toString(36).substring(2, 15).toUpperCase();
  
  const response = await fetch('https://businessapi.cashwyre.com/api/v1.0/CustomerCard/getCards', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CASHWYRE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appId: import.meta.env.VITE_CASHWYRE_APP_ID,
      businessCode: import.meta.env.VITE_CASHWYRE_BUSINESS_CODE,
      requestId,
      customerCode: '',
      customerEmail,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch card balance');
  }

  const result = await response.json();
  const card = result.data?.find((c: any) => c.code === cardCode);
  
  if (!card) {
    throw new Error('Card not found');
  }

  return {
    balance: card.cardBalance,
    status: card.status,
    cardNumber: card.cardNumber,
    cardNumberMasked: card.cardNumberMaxked,
    expiryDate: card.validMonthYear,
    cvv: card.cvV2,
    cvvMasked: card.cvV2Maxed,
    cardholderName: card.cardName,
  };
}

export async function getCardTransactions(cardCode: string) {
  const requestId = Math.random().toString(36).substring(2, 15).toUpperCase();
  
  const response = await fetch('https://businessapi.cashwyre.com/api/v1.0/CustomerCard/getCardTransactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CASHWYRE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appId: import.meta.env.VITE_CASHWYRE_APP_ID,
      businessCode: import.meta.env.VITE_CASHWYRE_BUSINESS_CODE,
      requestId,
      cardCode,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  const result = await response.json();
  return result.data || [];
}

export async function notifyTopUp(
  cardCode: string,
  amountInUSD: number,
  walletAddress: string,
  txHash: string
) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram not configured');
    return;
  }

  const message = `💰 Card Top-Up Received\n\nCard: ${cardCode}\nAmount: $${amountInUSD}\nWallet: ${walletAddress}\nTX: ${txHash}`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
}
