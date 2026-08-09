import GithubSlugger from 'github-slugger'

export interface MarkdownHeading {
  depth: 2 | 3
  text: string
  id: string
}

export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const slugger = new GithubSlugger()
  return markdown.split('\n').flatMap((line) => {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) return []
    const text = match[2].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`~]/g, '').trim()
    return text ? [{ depth: match[1].length as 2 | 3, text, id: slugger.slug(text) }] : []
  })
}
