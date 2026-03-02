'use client';

import { useEffect, useRef } from 'react';

interface Props {
    transactionId: string;
    value: number;
    currency?: string;
}

/**
 * Fires a Google Ads conversion event once gtag is ready.
 * Waits up to 5 seconds for gtag to become available.
 * 
 * Conversion ID: AW-17595795029
 */
export default function GoogleAdsConversion({ transactionId, value, currency = 'USD' }: Props) {
    const fired = useRef(false);

    useEffect(() => {
        if (fired.current) return;

        const fireConversion = () => {
            if (fired.current) return;
            if (typeof window !== 'undefined' && typeof (window as Record<string, unknown>).gtag === 'function') {
                fired.current = true;
                const gtag = (window as Record<string, unknown>).gtag as (...args: unknown[]) => void;
                gtag('event', 'conversion', {
                    'send_to': 'AW-17595795029/BLrzCObvwt4bENWMqsZB',
                    'value': value,
                    'currency': currency,
                    'transaction_id': transactionId,
                });
                console.log(`✅ Google Ads conversion fired: value=${value}, currency=${currency}, txn=${transactionId}`);
                return true;
            }
            return false;
        };

        // Try immediately
        if (fireConversion()) return;

        // Retry every 200ms for up to 5 seconds
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (fireConversion() || attempts >= 25) {
                clearInterval(interval);
                if (attempts >= 25 && !fired.current) {
                    console.error('❌ Google Ads conversion: gtag not available after 5s');
                }
            }
        }, 200);

        return () => clearInterval(interval);
    }, [transactionId, value, currency]);

    // No script tag needed — we call gtag directly via useEffect
    return null;
}
