'use client';

import Script from 'next/script';

interface Props {
    transactionId: string;
    value: number;
    currency?: string;
}

/**
 * Fires a Google Ads conversion event on mount.
 * Place this component on the enrollment success page.
 * 
 * Conversion ID: AW-17595795029
 * You need to create/configure the conversion action in your Google Ads account
 * and replace the conversion label below with your actual label.
 */
export default function GoogleAdsConversion({ transactionId, value, currency = 'USD' }: Props) {
    return (
        <Script id="google-ads-conversion" strategy="afterInteractive">
            {`
                gtag('event', 'conversion', {
                    'send_to': 'AW-17595795029/BLrzCObvwt4bENWMqsZB',
                    'value': ${value},
                    'currency': '${currency}',
                    'transaction_id': '${transactionId}',
                });
            `}
        </Script>
    );
}
