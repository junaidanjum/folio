import { paginateElements } from './pagination'

const block = (tagName: 'h1' | 'h2' | 'p', text: string, height: number) => {
  const element = document.createElement(tagName)
  element.textContent = text
  element.dataset.height = String(height)
  return element
}

const measure = (blocks: HTMLElement[]) =>
  blocks.reduce((height, element) => {
    if (element.matches('.code-block')) return height + element.querySelectorAll('.line').length * 20 + 20
    if (element.matches('table')) return height + element.querySelectorAll('tr').length * 30
    return height + Number(element.dataset.height)
  }, 0)

const table = () => {
  const element = document.createElement('table')
  element.innerHTML =
    '<thead><tr><th>Term</th></tr></thead><tbody>' + Array.from({ length: 8 }, (_, index) => `<tr><td>Row ${index}</td></tr>`).join('') + '</tbody>'
  return element
}

const pageElement = (html: string) => {
  const page = document.createElement('div')
  page.innerHTML = html
  return page
}

describe('paginateElements', () => {
  it('keeps headings with their next block and continues heading numbers across pages', () => {
    const pages = paginateElements(
      [block('h1', 'First', 40), block('p', 'Opening', 100), block('h2', 'Details', 40), block('p', 'Body', 100)],
      150,
      measure,
    )
    expect(pages).toHaveLength(2)
    expect(pages[0]).toContain('data-heading-number="1"')
    expect(pages[0]).toContain('Opening')
    expect(pages[1]).toContain('data-heading-number="1.1"')
    expect(pages[1]).toContain('Body')
  })

  it('splits tables into available space and repeats headers without losing rows', () => {
    const original = table()
    const pages = paginateElements([block('p', 'Introduction', 60), block('h2', 'Definitions', 30), original], 180, measure).map(pageElement)
    expect(pages[0].querySelector('h2')).toHaveTextContent('Definitions')
    expect(pages[0].querySelectorAll('tbody tr')).toHaveLength(2)
    expect(pages.every((page) => page.querySelector('thead')?.textContent === 'Term')).toBe(true)
    expect(pages.flatMap((page) => [...page.querySelectorAll('tbody tr')].map((row) => row.textContent))).toEqual(
      [...original.querySelectorAll('tbody tr')].map((row) => row.textContent),
    )
    expect(pages.every((page) => measure([...page.children] as HTMLElement[]) <= 180)).toBe(true)
  })

  it('moves a heading with the first table row when neither fits', () => {
    const pages = paginateElements([block('p', 'Introduction', 100), block('h2', 'Definitions', 30), table()], 180, measure)
    expect(pages[0]).not.toContain('Definitions')
    expect(pages[1]).toContain('Definitions')
    expect(pages[1]).toContain('Row 0')
  })

  it('preserves every code line and syntax span across multiple pages', () => {
    const code = document.createElement('figure')
    code.className = 'code-block'
    code.innerHTML =
      '<pre><code>' +
      Array.from({ length: 20 }, (_, index) => `<span class="line"><span style="color: red">line ${index}</span></span>`).join('\n') +
      '</code></pre>'
    const pages = paginateElements([block('h2', 'Contract types', 30), code], 150, measure).map(pageElement)
    expect(pages.length).toBeGreaterThan(1)
    expect(pages[0].querySelector('h2')).toHaveTextContent('Contract types')
    expect(pages.map((page) => page.querySelector('code')?.textContent).join('')).toBe(code.querySelector('code')?.textContent)
    expect(pages.flatMap((page) => [...page.querySelectorAll('.line > span')])).toHaveLength(20)
    expect(pages.every((page) => measure([...page.children] as HTMLElement[]) <= 150)).toBe(true)
  })

  it('always returns one page for an empty document', () => {
    expect(paginateElements([], 150, measure)).toEqual([''])
  })
})

describe('oversized content', () => {
  const textMeasure = (blocks: HTMLElement[]) =>
    blocks.reduce((height, element) => {
      if (element.matches('table'))
        return height + 10 + Math.max(...Array.from(element.querySelectorAll('tbody td')).map((cell) => cell.textContent?.length ?? 0))
      return height + (element.textContent?.length ?? 0)
    }, 0)

  it.each(['p', 'blockquote', 'ul', 'ol'])('preserves text and inline markup in a long %s', (tag) => {
    const element = document.createElement(tag)
    const content = '<strong>' + 'important '.repeat(25) + '</strong><a href="https://example.com">' + 'linked '.repeat(25) + '</a>'
    element.innerHTML = ['ul', 'ol'].includes(tag) ? `<li>${content}</li>` : content
    const pages = paginateElements([element], 100, textMeasure).map(pageElement)
    expect(pages.length).toBeGreaterThan(1)
    expect(pages.map((page) => page.textContent).join('')).toBe(element.textContent)
    expect(pages.every((page) => textMeasure([...page.children] as HTMLElement[]) <= 100)).toBe(true)
    expect(pages.flatMap((page) => [...page.querySelectorAll('strong')]).length).toBeGreaterThan(1)
  })

  it('splits a tall row by cell while repeating table headers', () => {
    const element = document.createElement('table')
    element.innerHTML = `<thead><tr><th>Key</th><th>Value</th></tr></thead><tbody><tr><td>Short label</td><td><em>${'long cell '.repeat(50)}</em></td></tr></tbody>`
    const pages = paginateElements([element], 100, textMeasure).map(pageElement)
    for (let column = 0; column < 2; column += 1) {
      expect(pages.map((page) => page.querySelectorAll('tbody td')[column].textContent).join('')).toBe(
        element.querySelectorAll('tbody td')[column].textContent,
      )
    }
    expect(pages.every((page) => page.querySelector('thead')?.textContent === 'KeyValue')).toBe(true)
    expect(pages.every((page) => textMeasure([...page.children] as HTMLElement[]) <= 100)).toBe(true)
  })

  it('refuses a layout that would clip an indivisible object', () => {
    const image = document.createElement('img')
    expect(() => paginateElements([image], 100, () => 500)).toThrow('cannot fit')
  })
})

it('retains list items and strong ancestors when both boundaries fall inside one text node', () => {
  const element = document.createElement('ol')
  element.innerHTML = '<li><strong>' + 'nested text '.repeat(100) + '</strong></li>'
  const pages = paginateElements([element], 100, (blocks) => blocks.reduce((sum, block) => sum + (block.textContent?.length ?? 0), 0)).map(
    pageElement,
  )
  expect(pages.every((page) => page.querySelector('ol > li > strong'))).toBe(true)
  expect(pages.map((page) => page.querySelector('li')?.textContent).join('')).toBe(element.textContent)
})
