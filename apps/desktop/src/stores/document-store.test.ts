import { parseRecentPaths } from './document-store'

describe('parseRecentPaths', () => {
  it('returns an empty list for invalid persisted data', () => {
    expect(parseRecentPaths('{not json')).toEqual([])
    expect(parseRecentPaths('{"path":"notes.md"}')).toEqual([])
  })

  it('keeps unique non-empty paths and applies the recent-document limit', () => {
    const paths = ['/1.md', '/2.md', '/1.md', '', '/3.md', '/4.md', '/5.md', '/6.md', '/7.md', 42]

    expect(parseRecentPaths(JSON.stringify(paths))).toEqual(['/1.md', '/2.md', '/3.md', '/4.md', '/5.md', '/6.md'])
  })
})
