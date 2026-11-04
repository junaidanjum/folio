import { create } from 'zustand'
import type { OpenDocument } from '../types/document'

type DocumentStore = {
  document: OpenDocument | null
  recentPaths: string[]
  status: 'idle' | 'loading' | 'ready' | 'error' | 'reloaded'
  error: string | null
  setDocument: (document: OpenDocument) => void
  setStatus: (status: DocumentStore['status']) => void
  setError: (error: string) => void
  close: () => void
}

const RECENT_DOCUMENT_LIMIT = 6

export const parseRecentPaths = (value: string | null): string[] => {
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((path): path is string => typeof path === 'string' && path.length > 0))].slice(0, RECENT_DOCUMENT_LIMIT)
  } catch {
    return []
  }
}

const savedRecent = parseRecentPaths(localStorage.getItem('folio-recent'))

export const useDocumentStore = create<DocumentStore>((set) => ({
  document: null,
  recentPaths: savedRecent,
  status: 'idle',
  error: null,
  setDocument: (document) =>
    set((state) => {
      const recentPaths = document.path
        ? [document.path, ...state.recentPaths.filter((path) => path !== document.path)].slice(0, RECENT_DOCUMENT_LIMIT)
        : state.recentPaths
      localStorage.setItem('folio-recent', JSON.stringify(recentPaths))
      return { document, recentPaths, status: 'ready', error: null }
    }),
  setStatus: (status) => set({ status, ...(status === 'error' ? {} : { error: null }) }),
  setError: (error) => set({ error, status: 'error' }),
  close: () => set({ document: null, status: 'idle', error: null }),
}))
