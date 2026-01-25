import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'GHS' | 'USD' | 'EUR' | 'GBP';

interface CurrencyState {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: 'GHS',
            setCurrency: (currency) => set({ currency }),
        }),
        {
            name: 'currency-storage',
        }
    )
);
