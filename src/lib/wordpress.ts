// WordPress REST API client for headless CMS blog integration
const WP_API_URL = process.env.WORDPRESS_API_URL || 'https://y8e.62b.myftpupload.com/wp-json/wp/v2';

export interface WPPost {
    id: number;
    slug: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    date: string;
    modified: string;
    featured_media: number;
    categories: number[];
    tags: number[];
    _embedded?: {
        'wp:featuredmedia'?: Array<{
            source_url: string;
            alt_text: string;
        }>;
        'wp:term'?: Array<Array<{
            id: number;
            name: string;
            slug: string;
        }>>;
    };
}

export interface WPCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}

/**
 * Fetch blog posts from WordPress REST API
 */
export async function getPosts(options?: {
    page?: number;
    perPage?: number;
    category?: number;
    search?: string;
}): Promise<{ posts: WPPost[]; totalPages: number; total: number }> {
    const { page = 1, perPage = 12, category, search } = options || {};

    const params = new URLSearchParams({
        _embed: 'true',
        page: String(page),
        per_page: String(perPage),
        orderby: 'date',
        order: 'desc',
    });

    if (category) params.set('categories', String(category));
    if (search) params.set('search', search);

    const res = await fetch(`${WP_API_URL}/posts?${params}`, {
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
        return { posts: [], totalPages: 0, total: 0 };
    }

    const posts: WPPost[] = await res.json();
    const totalPages = Number(res.headers.get('X-WP-TotalPages') || '1');
    const total = Number(res.headers.get('X-WP-Total') || '0');

    return { posts, totalPages, total };
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
    const res = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed=true`, {
        next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const posts: WPPost[] = await res.json();
    return posts[0] || null;
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<WPCategory[]> {
    const res = await fetch(`${WP_API_URL}/categories?per_page=100&hide_empty=true`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) return [];
    return res.json();
}

/**
 * Fetch all post slugs for static generation
 */
export async function getAllPostSlugs(): Promise<string[]> {
    const slugs: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const res = await fetch(`${WP_API_URL}/posts?per_page=100&page=${page}&_fields=slug`, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) break;

        const posts: { slug: string }[] = await res.json();
        slugs.push(...posts.map((p) => p.slug));

        const totalPages = Number(res.headers.get('X-WP-TotalPages') || '1');
        hasMore = page < totalPages;
        page++;
    }

    return slugs;
}

/**
 * Strip HTML tags from a string (for excerpts)
 */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Format a WordPress date string
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
