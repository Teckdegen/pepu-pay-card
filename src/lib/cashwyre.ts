const CASHWYRE_BASE = 'https://businessapi.cashwyre.com/api/v1.0';

export interface CashwyreRequest {
  appId: string;
  requestId: string;
  businessCode: string;
}

export interface GetCardsRequest extends CashwyreRequest {
  customerCode: string;
  customerEmail: string;
}

export interface GetTransactionsRequest extends CashwyreRequest {
  cardCode: string;
}

export interface CardData {
  code: string;
  customerName: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  cardBrand: string;
  cardType: string;
  reference: string;
  last4: string;
  cardName: string;
  expiryOn: string;
  expiryOnInfo: string;
  validMonthYear: string;
  status: string;
  cardBalance: number;
  cardBalanceInfo: string;
  cardNumber: string;
  cardNumberMaxked: string;
  cvV2: string;
  cvV2Maxed: string;
  billingAddressCity: string;
  billingAddressStreet: string;
  billingAddressCountry: string;
  billingAddressZipCode: string;
  customerCode: string;
  createdOn: string;
}

export interface Transaction {
  code: string;
  description: string;
  status: string;
  reference: string;
  amount: number;
  amountInfo: string;
  fee: number;
  feeInfo: string;
  centAmount: number;
  currency: string;
  createdOn: string;
  drcr: 'DR' | 'CR';
  category: string;
  customerName: string;
  customerEmail: string;
}

export async function cashwyrePost<T>(endpoint: string, body: any): Promise<T> {
  const requestId = Math.random().toString(36).substring(2, 15).toUpperCase();
  
  const requestBody = {
    ...body,
    appId: process.env.CASHWYRE_APP_ID || '',
    businessCode: process.env.CASHWYRE_BUSINESS_CODE || '',
    requestId,
  };

  const response = await fetch(`${CASHWYRE_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CASHWYRE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cashwyre API Error: ${response.status} - ${error}`);
  }

  return response.json();
}
