import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories, stripHtml, formatDate, WPPost } from '@/lib/wordpress';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Blog — Community Service News & Resources',
    description:
        'Read the latest articles on community service requirements, court-approved programs, volunteer opportunities, and tips for completing your hours online.',
};

function PostCard({ post }: { post: WPPost }) {
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
    const categories = post._embedded?.['wp:term']?.[0] || [];

    return (
        <article className={styles.postCard}>
            {featuredImage && (
                <Link href={`/blog/${post.slug}`} className={styles.imageLink}>
                    <img
                        src={featuredImage.source_url}
                        alt={featuredImage.alt_text || stripHtml(post.title.rendered)}
                        className={styles.postImage}
                        loading="lazy"
                    />
                </Link>
            )}
            <div className={styles.postContent}>
                {categories.length > 0 && (
                    <div className={styles.categories}>
                        {categories.map((cat) => (
                            <span key={cat.id} className={styles.categoryBadge}>
                                {cat.name}
                            </span>
                        ))}
                    </div>
                )}
                <Link href={`/blog/${post.slug}`} className={styles.postTitleLink}>
                    <h2
                        className={styles.postTitle}
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                </Link>
                <p className={styles.postExcerpt}>
                    {stripHtml(post.excerpt.rendered)}
                </p>
                <div className={styles.postMeta}>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                        Read More →
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default async function BlogPage() {
    const [{ posts, total }, categories] = await Promise.all([
        getPosts({ perPage: 12 }),
        getCategories(),
    ]);

    return (
        <div className={styles.blogPage}>
            {/* Hero */}
            <section className={styles.blogHero}>
                <h1>Blog</h1>
                <p>
                    News, guides, and resources for community service requirements across all 50 states.
                </p>
            </section>

            {/* Main content */}
            <section className={styles.blogMain}>
                {posts.length === 0 ? (
                    <div className={styles.noPosts}>
                        <h2>Coming Soon</h2>
                        <p>
                            We&apos;re working on helpful articles about community service requirements,
                            court-approved programs, and tips for completing your hours online.
                            Check back soon!
                        </p>
                        <Link href="/" className={styles.backHome}>
                            ← Back to Home
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Category filters */}
                        {categories.length > 0 && (
                            <div className={styles.categoryFilters}>
                                <span className={`${styles.filterPill} ${styles.active}`}>
                                    All ({total})
                                </span>
                                {categories.map((cat) => (
                                    <span key={cat.id} className={styles.filterPill}>
                                        {cat.name} ({cat.count})
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Posts grid */}
                        <div className={styles.postsGrid}>
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
