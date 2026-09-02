// Lightweight currency display helper.
// The active symbol is set from the authenticated user's currency
// (see App.tsx) and read at render time across components.

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  KES: 'KSh ',
  UGX: 'USh ',
  TZS: 'TSh ',
  NGN: '₦',
  ZAR: 'R ',
  RWF: 'FRw ',
  ETB: 'Br ',
  INR: '₹',
};

let symbol = '$';

export const setCurrency = (code?: string | null) => {
  if (!code) return;
  symbol = SYMBOLS[code.toUpperCase()] || `${code.toUpperCase()} `;
};

export const cur = () => symbol;

export const fmtMoney = (n: number) =>
  `${n < 0 ? '-' : ''}${symbol}${Math.abs(n).toLocaleString()}`;
