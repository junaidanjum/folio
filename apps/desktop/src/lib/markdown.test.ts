import { countWords, parseMarkdown, resolveAssetPath } from './markdown'

describe('parseMarkdown', () => {
  it('extracts supported frontmatter without displaying it', () => {
    const result = parseMarkdown('---\ntitle: Report\nauthor: Junaid\nignored: true\n---\n# Introduction')
    expect(result.frontmatter).toEqual({ title: 'Report', author: 'Junaid', subtitle: undefined, date: undefined })
    expect(result.content.trim()).toBe('# Introduction')
  })

  it('keeps malformed or absent metadata safe', () => {
    const result = parseMarkdown('# Plain document')
    expect(result.frontmatter).toEqual({ title: undefined, subtitle: undefined, author: undefined, date: undefined })
  })
})

describe('resolveAssetPath', () => {
  it('resolves relative images beside the Markdown file', () => {
    expect(resolveAssetPath('./images/chart.png', '/project/docs/report.md')).toBe('/project/docs/images/chart.png')
  })

  it('does not rewrite remote or data URLs', () => {
    expect(resolveAssetPath('https://example.com/chart.png', '/project/report.md')).toBe('https://example.com/chart.png')
    expect(resolveAssetPath('data:image/png;base64,abc', '/project/report.md')).toBe('data:image/png;base64,abc')
  })
})

describe('countWords', () => {
  it('counts prose without Markdown punctuation', () => {
    expect(countWords('# A short **useful** document')).toBe(4)
  })
})
