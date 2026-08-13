import Link from 'next/link'
import type { Product } from '@/lib/data'
import type { SocialPost } from '@/modules/social/domain/types'
import SocialFacebookEmbed from './SocialFacebookEmbed'
import SocialLinkPreview from './SocialLinkPreview'
import SocialMediaGallery from './SocialMediaGallery'
import SocialPostActions from './SocialPostActions'
import SocialPostContent from './SocialPostContent'
import SocialPostHeader from './SocialPostHeader'
import SocialRelatedProduct from './SocialRelatedProduct'

export default function SocialPostCard({ post, relatedProducts = [], detail = false, priorityMedia = false }: { post: SocialPost; relatedProducts?: Product[]; detail?: boolean; priorityMedia?: boolean }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl.replace(/\/$/, '')}/bai-viet/${post.slug}`
  const links = post.facebookSourceUrl && post.postType === 'native' && !post.links.some((link) => link.url === post.facebookSourceUrl)
    ? [...post.links, { url: post.facebookSourceUrl, domain: 'facebook.com', title: 'Bài viết gốc', description: '', imageUrl: '' }]
    : post.links
  return <article className={`social-post-card ${detail ? 'social-post-card-detail' : ''}`}>
    <SocialPostHeader author={post.author} publishedAt={post.publishedAt || post.scheduledAt} source={post.postType === 'facebook_embed' ? 'Facebook' : undefined} />
    <SocialPostContent title={post.title} text={post.text} sourceUrl={post.facebookSourceUrl} category={post.category} headingLevel={detail ? 1 : 2} />
    {post.postType === 'facebook_embed' ? <SocialFacebookEmbed url={post.facebookEmbedUrl || post.facebookSourceUrl} /> : <SocialMediaGallery media={post.media} priority={priorityMedia || detail} />}
    {links.map((link) => <SocialLinkPreview key={link.url} link={link} />)}
    {relatedProducts.length > 0 && <section className="mt-5 border-t border-[var(--sonic-line)] pt-4"><p className="sonic-label text-[var(--sonic-subtle)]">Thiết bị trong bài</p><div className="mt-3">{relatedProducts.slice(0, 3).map((product) => <SocialRelatedProduct key={product.id} product={product} />)}</div></section>}
    {post.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <Link key={tag} href={`/bai-viet?category=${encodeURIComponent(post.category)}`} className="text-xs text-[var(--sonic-gold)]">#{tag.replace(/^#/, '')}</Link>)}</div>}
    <SocialPostActions url={postUrl} />
  </article>
}
