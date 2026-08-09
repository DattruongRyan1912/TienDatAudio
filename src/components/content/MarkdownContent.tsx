import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

export default function MarkdownContent({ markdown, className = '' }: { markdown: string; className?: string }) {
  return <div className={`sonic-prose ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeSanitize]}>{markdown}</ReactMarkdown>
  </div>
}
