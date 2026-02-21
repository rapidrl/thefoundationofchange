import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
});

// Program tiers matching the pricing page
export const PROGRAM_TIERS = [
    { id: 'tier_1_10', hours: '1–10', maxHours: 10, price: 2899, label: '1–10 Hours' },
    { id: 'tier_11_25', hours: '11–25', maxHours: 25, price: 4499, label: '11–25 Hours' },
    { id: 'tier_26_50', hours: '26–50', maxHours: 50, price: 5999, label: '26–50 Hours' },
    { id: 'tier_51_100', hours: '51–100', maxHours: 100, price: 7999, label: '51–100 Hours' },
    { id: 'tier_101_250', hours: '101–250', maxHours: 250, price: 11999, label: '101–250 Hours' },
    { id: 'tier_251_500', hours: '251–500', maxHours: 500, price: 16999, label: '251–500 Hours' },
    { id: 'tier_501_1000', hours: '501–1000', maxHours: 1000, price: 22999, label: '501–1000 Hours' },
] as const;

export type ProgramTier = typeof PROGRAM_TIERS[number];

export function getTierById(id: string): ProgramTier | undefined {
    return PROGRAM_TIERS.find((t) => t.id === id);
}
