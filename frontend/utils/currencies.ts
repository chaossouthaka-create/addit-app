// Currency definitions for ADDIT

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
];

export const getCurrencySymbol = (code: string): string => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.symbol ?? '$';
};

export const formatPrice = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = amount.toFixed(2);
  
  // Format based on currency
  if (['EUR', 'CHF', 'BRL'].includes(currencyCode)) {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
};
