import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs, stripHtml, formatDate } from '@/lib/wordpress';
import styles from './page.module.css';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) return { title: 'Post Not Found' };

    return {
        title: stripHtml(post.title.rendered),
        description: stripHtml(post.excerpt.rendered).slice(0, 160),
        openGraph: {
            title: stripHtml(post.title.rendered),
            description: stripHtml(post.excerpt.rendered).slice(0, 160),
            type: 'article',
            publishedTime: post.date,
            modifiedTime: post.modified,
        },
    };
}

export async function generateStaticParams() {
    try {
        const slugs = await getAllPostSlugs();
        return slugs.map((slug) => ({ slug }));
    } catch {
        return [];
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) notFound();

    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
    const categories = post._embedded?.['wp:term']?.[0] || [];

    return (
        <div className={styles.postPage}>
            <article className={styles.article}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/blog">Blog</Link>
                    <span>/</span>
                    <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </nav>

                {/* Header */}
                <header className={styles.articleHeader}>
                    {categories.length > 0 && (
                        <div className={styles.articleCategories}>
                            {categories.map((cat) => (
                                <span key={cat.id} className={styles.categoryTag}>
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}
                    <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    <div className={styles.articleMeta}>
                        <time dateTime={post.date}>Published {formatDate(post.date)}</time>
                        {post.modified !== post.date && (
                            <time dateTime={post.modified}> · Updated {formatDate(post.modified)}</time>
                        )}
                    </div>
                </header>

                {/* Featured image */}
                {featuredImage && (
                    <div className={styles.featuredImage}>
                        <img
                            src={featuredImage.source_url}
                            alt={featuredImage.alt_text || stripHtml(post.title.rendered)}
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className={styles.articleContent}
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />

                {/* Back link */}
                <div className={styles.backSection}>
                    <Link href="/blog" className={styles.backLink}>
                        ← Back to Blog
                    </Link>
                </div>
            </article>
        </div>
    );
}
