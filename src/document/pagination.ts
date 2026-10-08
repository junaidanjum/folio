import { textFragments } from './text-fragments'

type MeasurePage = (blocks: HTMLElement[]) => number

type Fragments = {
  count: number
  slice: (start: number, end: number) => HTMLElement
}

const fragmentsFor = (block: HTMLElement): Fragments => {
  const code = block.matches('.code-block') ? block.querySelector('pre code') : null
  const lines = code ? Array.from(code.querySelectorAll(':scope > .line')) : []
  if (lines.length) {
    return {
      count: lines.length,
      slice: (start, end) => {
        const fragment = block.cloneNode(true) as HTMLElement
        const target = fragment.querySelector('pre code')!
        target.replaceChildren()
        for (let index = start; index < end; index += 1) {
          target.append(lines[index].cloneNode(true))
          if (index < lines.length - 1) target.append('\n')
        }
        return fragment
      },
    }
  }

  if (block instanceof HTMLTableElement && block.tBodies.length === 1) {
    const rows = Array.from(block.tBodies[0].rows)
    const template = block.cloneNode(true) as HTMLTableElement
    // Keep column widths stable when different rows appear on each page.
    const cells = block.rows[0]?.cells
    const width = block.getBoundingClientRect().width
    if (!template.querySelector('colgroup') && cells && width > 0) {
      const columns = document.createElement('colgroup')
      for (const cell of cells) {
        const column = document.createElement('col')
        column.style.width = `${(cell.getBoundingClientRect().width / width) * 100}%`
        columns.append(column)
      }
      template.prepend(columns)
      template.style.tableLayout = 'fixed'
    }
    if (rows.length) {
      return {
        count: rows.length,
        slice: (start, end) => {
          const fragment = template.cloneNode(true) as HTMLTableElement
          fragment.tBodies[0].replaceChildren(...rows.slice(start, end).map((row) => row.cloneNode(true)))
          if (end < rows.length) fragment.tFoot?.remove()
          return fragment
        },
      }
    }
  }

  if (block.matches('ul, ol')) {
    const items = Array.from(block.children)
    return {
      count: items.length,
      slice: (start, end) => {
        const fragment = block.cloneNode(false) as HTMLElement
        if (block instanceof HTMLOListElement) fragment.setAttribute('start', String((block.start || 1) + start))
        fragment.append(...items.slice(start, end).map((item) => item.cloneNode(true)))
        return fragment
      },
    }
  }

  return { count: 1, slice: () => block.cloneNode(true) as HTMLElement }
}

const splitOversized = (block: HTMLElement): Fragments => {
  if (block instanceof HTMLTableElement && block.tBodies[0]?.rows.length === 1) {
    const cells = Array.from(block.tBodies[0].rows[0].cells).map(textFragments)
    return {
      count: Math.max(0, ...cells.map((cell) => cell.count)),
      slice: (start, end) => {
        const fragment = block.cloneNode(true) as HTMLTableElement
        const row = fragment.tBodies[0].rows[0]
        row.replaceChildren(...cells.map((cell) => cell.slice(start, end)))
        return fragment
      },
    }
  }
  const code = block.matches('.code-block') ? block.querySelector<HTMLElement>('pre code') : null
  if (code) {
    const text = textFragments(code)
    return {
      count: text.count,
      slice: (start, end) => {
        const fragment = block.cloneNode(true) as HTMLElement
        fragment.querySelector('pre code')!.replaceWith(text.slice(start, end))
        return fragment
      },
    }
  }
  return textFragments(block)
}

export const paginateElements = (blocks: Element[], availableHeight: number, measure: MeasurePage): string[] => {
  const pages: string[] = []
  let pageBlocks: HTMLElement[] = []
  let headings: HTMLElement[] = []
  let headingOne = 0
  let headingTwo = 0

  const finishPage = () => {
    if (pageBlocks.length) pages.push(pageBlocks.map((block) => block.outerHTML).join(''))
    pageBlocks = []
  }

  const place = (fragments: Fragments, canSplit: boolean) => {
    let start = 0
    while (start < fragments.count) {
      const first = fragments.slice(start, start + 1)
      if (pageBlocks.length && measure([...pageBlocks, ...headings, first]) > availableHeight) finishPage()
      if (measure([first]) > availableHeight) {
        const smaller = splitOversized(first)
        if (!canSplit || smaller.count === 0)
          throw new Error(
            'Some content cannot fit on this paper size. Use larger paper, smaller text, or narrower margins. The full document is shown below; printing is paused to prevent missing content.',
          )
        place(smaller, false)
        start += 1
        continue
      }
      if (measure([...headings, first]) > availableHeight) {
        for (const heading of headings) {
          if (measure([heading]) > availableHeight) throw new Error('A heading is taller than a page. Reduce the font size or use larger paper.')
          if (pageBlocks.length && measure([...pageBlocks, heading]) > availableHeight) finishPage()
          pageBlocks.push(heading)
        }
        headings = []
        finishPage()
      }

      let end = start + 1
      let high = fragments.count
      while (end < high) {
        const middle = Math.ceil((end + high) / 2)
        if (measure([...pageBlocks, ...headings, fragments.slice(start, middle)]) <= availableHeight) end = middle
        else high = middle - 1
      }
      pageBlocks.push(...headings, fragments.slice(start, end))
      headings = []
      start = end
      if (start < fragments.count) finishPage()
    }
  }

  for (const original of blocks) {
    const block = original as HTMLElement
    if (/^H[1-6]$/.test(block.tagName)) {
      const heading = block.cloneNode(true) as HTMLElement
      if (block.tagName === 'H1') {
        headingOne += 1
        headingTwo = 0
        heading.dataset.headingNumber = String(headingOne)
      } else if (block.tagName === 'H2') {
        headingTwo += 1
        heading.dataset.headingNumber = `${headingOne}.${headingTwo}`
      }
      headings.push(heading)
      continue
    }

    place(fragmentsFor(block), true)
  }

  if (headings.length) {
    const remaining = headings
    headings = []
    for (const heading of remaining) place({ count: 1, slice: () => heading }, true)
  }
  finishPage()
  return pages.length ? pages : ['']
}
