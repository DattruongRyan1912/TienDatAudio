export type MarkdownChunkDraft = {
  chunkIndex: number
  headingPath: string[]
  text: string
  normalizedText: string
  tokenCount: number
}
export function normalizeKnowledgeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```[^\n]*\n?|```$/g, ''))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*(?:[-*+] |\d+[.)] )/gm, '')
    .replace(/[>*_~`]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitLongText(value: string, maxCharacters: number) {
  if (value.length <= maxCharacters) return [value]
  const sentences = value.split(/(?<=[.!?。！？])\s+/).filter(Boolean)
  if (sentences.length === 1) {
    const parts: string[] = []
    for (let index = 0; index < value.length; index += maxCharacters) parts.push(value.slice(index, index + maxCharacters))
    return parts
  }
  const parts: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > maxCharacters) {
      parts.push(current.trim())
      current = ''
    }
    current += `${current ? ' ' : ''}${sentence}`
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

export function chunkMarkdown(markdown: string, maxCharacters = 1800): MarkdownChunkDraft[] {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n')
  const headingPath: string[] = []
  const sections: Array<{ headingPath: string[]; text: string }> = []
  let buffer: string[] = []

  function flush() {
    const cleaned = cleanMarkdown(buffer.join('\n'))
    if (cleaned) sections.push({ headingPath: [...headingPath], text: cleaned })
    buffer = []
  }

  for (const line of lines) {
    const heading = /^(#{1,4})\s+(.+?)\s*$/.exec(line)
    if (heading) {
      flush()
      const level = heading[1].length
      headingPath.splice(level - 1)
      headingPath[level - 1] = cleanMarkdown(heading[2]).slice(0, 240)
      continue
    }
    buffer.push(line)
  }
  flush()

  const chunks: MarkdownChunkDraft[] = []
  for (const section of sections) {
    for (const text of splitLongText(section.text, Math.max(600, maxCharacters))) {
      const normalizedText = normalizeKnowledgeText(`${section.headingPath.join(' ')} ${text}`)
      if (!normalizedText) continue
      chunks.push({
        chunkIndex: chunks.length,
        headingPath: section.headingPath,
        text,
        normalizedText,
        tokenCount: normalizedText.split(' ').filter(Boolean).length,
      })
    }
  }
  return chunks
}
