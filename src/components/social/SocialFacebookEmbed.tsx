export default function SocialFacebookEmbed({ url }: { url: string }) {
  if (!url) return null
  const embedUrl = url.includes('plugins.post.php') ? url : `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`
  return <div className="mt-5 overflow-hidden rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)]"><iframe src={embedUrl} title="Facebook post embed" loading="lazy" className="min-h-[520px] w-full border-0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /></div>
}
