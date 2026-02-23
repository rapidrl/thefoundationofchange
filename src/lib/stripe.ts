import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY is not set. Add it to .env.local');
        }
        _stripe = new Stripe(key, {
            apiVersion: '2026-01-28.clover',
            typescript: true,
        });
    }
    return _stripe;
}

/**
 * Pricing tiers — exact pricing from thefoundationofchange.org
 * Each tier defines a range; the user picks exact hours and the system
 * finds the matching tier automatically.
 */
export const PRICING_TIERS = [
    { id: 'tier-1-5', minHours: 1, maxHours: 5, priceInCents: 2899, price: '$28.99' },
    { id: 'tier-6-10', minHours: 6, maxHours: 10, priceInCents: 7899, price: '$78.99' },
    { id: 'tier-11-25', minHours: 11, maxHours: 25, priceInCents: 10599, price: '$105.99' },
    { id: 'tier-26-50', minHours: 26, maxHours: 50, priceInCents: 13499, price: '$134.99' },
    { id: 'tier-51-75', minHours: 51, maxHours: 75, priceInCents: 15499, price: '$154.99' },
    { id: 'tier-76-250', minHours: 76, maxHours: 250, priceInCents: 17499, price: '$174.99' },
    { id: 'tier-251-500', minHours: 251, maxHours: 500, priceInCents: 19499, price: '$194.99' },
    { id: 'tier-501-1000', minHours: 501, maxHours: 1000, priceInCents: 21499, price: '$214.99' },
] as const;

/**
 * Find the pricing tier for a given number of hours.
 * Returns the tier or null if hours is out of range.
 */
export function getTierForHours(hours: number) {
    return PRICING_TIERS.find((t) => hours >= t.minHours && hours <= t.maxHours) || null;
}
