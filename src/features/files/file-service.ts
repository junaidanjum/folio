import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { parseMarkdown } from '../../lib/markdown'
import type { OpenDocument } from '../../types/document'

const isTauri = () => Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)

export const openDocumentPath = async (path: string): Promise<OpenDocument> => {
  const result = await invoke<{ content: string; name: string; path: string }>('read_markdown_file', { path })
  const parsed = parseMarkdown(result.content)
  return { ...result, ...parsed }
}

export const pickMarkdownFile = async (): Promise<OpenDocument | null> => {
  if (isTauri()) {
    const path = await open({ multiple: false, filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }] })
    return typeof path === 'string' ? openDocumentPath(path) : null
  }

  return new Promise((resolve) => {
    const input = window.document.querySelector<HTMLInputElement>('#folio-browser-file-input') ?? window.document.createElement('input')
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const content = await file.text()
      const parsed = parseMarkdown(content)
      resolve({ name: file.name, path: null, content: parsed.content, frontmatter: parsed.frontmatter })
      input.value = ''
    }
    input.click()
  })
}

export const documentFromDroppedFile = async (file: File): Promise<OpenDocument> => {
  if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('Choose a .md or .markdown file.')
  const content = await file.text()
  const parsed = parseMarkdown(content)
  return { name: file.name, path: null, content: parsed.content, frontmatter: parsed.frontmatter }
}

export const startWatching = async (path: string) => invoke<void>('watch_markdown_file', { path })
