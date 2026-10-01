import { paginateElements } from './pagination'

const block = (tagName: 'h1' | 'h2' | 'p', text: string, height: number) => {
  const element = document.createElement(tagName)
  element.textContent = text
  element.getBoundingClientRect = () => ({ height }) as DOMRect
  return element
}

describe('paginateElements', () => {
  it('keeps headings with their next block and continues heading numbers across pages', () => {
    const container = document.createElement('div')
    container.append(block('h1', 'First', 40), block('p', 'Opening', 100), block('h2', 'Details', 40), block('p', 'Body', 100))

    const pages = paginateElements(Array.from(container.children), 150)

    expect(pages).toHaveLength(2)
    expect(pages[0]).toContain('data-heading-number="1"')
    expect(pages[0]).toContain('Opening')
    expect(pages[1]).toContain('data-heading-number="1.1"')
    expect(pages[1]).toContain('Body')
  })

  it('always returns one page for an empty document', () => {
    expect(paginateElements([], 150)).toEqual([''])
  })
})
