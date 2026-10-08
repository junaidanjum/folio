import { StrictMode } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { App } from './App'
import { useDocumentStore } from './stores/document-store'

const native = vi.hoisted(() => ({
  listeners: new Map<string, (event: { payload: unknown }) => void>(),
  pendingPath: null as string | null,
  invoke: vi.fn(),
}))

vi.mock('@tauri-apps/api/core', () => ({ invoke: native.invoke }))
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(async (event: string, callback: (event: { payload: unknown }) => void) => {
    native.listeners.set(event, callback)
    return () => {
      if (native.listeners.get(event) === callback) native.listeners.delete(event)
    }
  }),
}))
vi.mock('./document/DocumentPreview', () => ({
  DocumentPreview: ({ document }: { document: { content: string } }) => <article>{document.content}</article>,
}))

beforeEach(() => {
  Object.defineProperty(window, '__TAURI_INTERNALS__', { configurable: true, value: {} })
  useDocumentStore.setState({ document: null, status: 'idle', error: null, recentPaths: [] })
  native.listeners.clear()
  native.pendingPath = null
  native.invoke.mockReset()
  native.invoke.mockImplementation(async (command: string, args?: { path: string }) => {
    if (command === 'initial_file') {
      const path = native.pendingPath
      native.pendingPath = null
      return path
    }
    if (command === 'read_markdown_file') return { path: args?.path, name: 'notes.md', content: `Opened ${args?.path}` }
  })
})

afterEach(() => {
  cleanup()
  Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
})

it('opens a file received before the interface is ready, including Strict Mode remounts', async () => {
  native.pendingPath = '/tmp/launch notes.md'
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  await screen.findByText('Opened /tmp/launch notes.md')
  expect(native.invoke).toHaveBeenCalledWith('watch_markdown_file', { path: '/tmp/launch notes.md' })
})

it('opens files received from macOS after startup and replaces the current document', async () => {
  render(<App />)
  await waitFor(() => expect(native.invoke).toHaveBeenCalledWith('initial_file'))
  for (const path of ['/tmp/first.md', '/tmp/second.markdown']) {
    await act(async () => {
      native.pendingPath = path
      native.listeners.get('markdown-open-requested')?.({ payload: null })
    })
    await screen.findByText(`Opened ${path}`)
    expect(native.invoke).toHaveBeenCalledWith('watch_markdown_file', { path })
  }
  cleanup()
  expect(native.listeners.size).toBe(0)
})

it('opens native drops with their filesystem path and ignores reloads after closing', async () => {
  render(<App />)
  await waitFor(() => expect(native.listeners.has('tauri://drag-drop')).toBe(true))
  await act(async () => {
    native.listeners.get('tauri://drag-drop')?.({ payload: { paths: ['/tmp/drop.md'] } })
  })
  await screen.findByText('Opened /tmp/drop.md')
  expect(native.invoke).toHaveBeenCalledWith('watch_markdown_file', { path: '/tmp/drop.md' })
  act(() => useDocumentStore.getState().close())
  native.invoke.mockClear()
  await act(async () => {
    native.listeners.get('markdown-changed')?.({ payload: '/tmp/drop.md' })
  })
  expect(native.invoke).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Open Markdown file' })).toBeVisible()
})
