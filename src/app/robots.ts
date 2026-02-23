import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/dashboard/', '/coursework/', '/api/', '/enrollment/'],
            },
        ],
        sitemap: 'https://thefoundationofchange.org/sitemap.xml',
    };
}
