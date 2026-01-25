import { Currency } from '@/store/currency';

// Exchange rates as of January 2026 (approximate)
// Base currency: GHS (Ghana Cedi)
const EXCHANGE_RATES: Record<Currency, number> = {
    GHS: 1,
    USD: 0.065,  // 1 GHS ≈ 0.065 USD
    EUR: 0.060,  // 1 GHS ≈ 0.060 EUR
    GBP: 0.052,  // 1 GHS ≈ 0.052 GBP
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    GHS: '₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
};

export function convertPrice(amountInGHS: number, targetCurrency: Currency): number {
    return amountInGHS * EXCHANGE_RATES[targetCurrency];
}

export function formatPrice(amountInGHS: number, currency: Currency): string {
    const converted = convertPrice(amountInGHS, currency);
    const symbol = CURRENCY_SYMBOLS[currency];

    // Format with 2 decimal places
    return `${symbol}${converted.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency): string {
    return CURRENCY_SYMBOLS[currency];
}
