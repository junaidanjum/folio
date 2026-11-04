import { parse } from 'yaml'
import type { Frontmatter } from '../types/document'

export type ParsedMarkdown = {
  content: string
  frontmatter: Frontmatter
}

export const parseMarkdown = (source: string): ParsedMarkdown => {
  const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
  let data: Record<string, unknown> = {}

  if (match) {
    try {
      const parsed = parse(match[1]) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed as Record<string, unknown>
    } catch {
      data = {}
    }
  }

  return {
    content: match ? source.slice(match[0].length) : source,
    frontmatter: {
      title: typeof data.title === 'string' ? data.title : undefined,
      subtitle: typeof data.subtitle === 'string' ? data.subtitle : undefined,
      author: typeof data.author === 'string' ? data.author : undefined,
      date: typeof data.date === 'string' ? data.date : undefined,
    },
  }
}

export const resolveAssetPath = (source: string, documentPath: string | null): string => {
  if (!documentPath || /^(https?:|data:|blob:)/i.test(source)) return source
  if (source.startsWith('/')) return source

  const directory = documentPath.replace(/[/\\][^/\\]+$/, '')
  return `${directory}/${source}`.replace(/[/\\]\.([/\\])/g, '$1')
}

export const countWords = (source: string) => {
  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~[\]()|-]/g, ' ')
    .trim()
  return plain ? plain.split(/\s+/).length : 0
}
