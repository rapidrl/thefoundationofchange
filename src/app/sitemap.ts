import type { MetadataRoute } from 'next';
import { states } from './states/stateData';

const BASE_URL = 'https://thefoundationofchange.org';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date().toISOString();

    // Core pages
    const corePages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE_URL}/community`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE_URL}/start-now`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE_URL}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/how-to-register`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/contact-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/certificate-verification`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/letter-of-introductions`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/additional-services`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/our-guarantee`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/terms-of-service`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/refund-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];

    // State index page
    const stateIndex: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/states`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ];

    // Individual state pages
    const statePages: MetadataRoute.Sitemap = states.map((state) => ({
        url: `${BASE_URL}/states/${state.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...corePages, ...stateIndex, ...statePages];
}
