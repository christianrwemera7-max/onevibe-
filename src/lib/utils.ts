
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'FC' | 'USD' = 'FC') {
  if (currency === 'USD') {
    // Basic conversion for demo: 1 USD = 2800 FC
    const usdAmount = amount / 2800;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(usdAmount);
  }
  
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
  }).format(amount).replace('CDF', 'FC');
}
