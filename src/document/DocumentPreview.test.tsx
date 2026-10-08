import { render, waitFor, cleanup } from '@testing-library/react'
import { DocumentPreview } from './DocumentPreview'
import { defaultSettings } from '../stores/settings-store'

vi.mock('shiki', () => ({
  createJavaScriptRegexEngine: () => ({}),
  getSingletonHighlighter: async () => ({
    codeToHtml: () => '<pre class="shiki"><code><span class="line"><span style="color: red">const value = 1</span></span></code></pre>',
  }),
}))

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('refreshes page snapshots when asynchronous highlighting changes markup without resizing it', async () => {
  const { container } = render(
    <DocumentPreview
      document={{ name: 'notes.md', path: null, content: '```ts\nconst value = 1\n```', frontmatter: {} }}
      settings={defaultSettings}
    />,
  )
  await waitFor(() => {
    expect(container.querySelector('.paper-content .shiki')).toHaveTextContent('const value = 1')
  })
  expect(container.querySelector('.paper-content pre pre')).toBeNull()
})
