const KEEP_WITH_NEXT_LIMIT = 120

const measuredHeight = (element: Element) => {
  const style = window.getComputedStyle(element)
  const marginTop = Number.parseFloat(style.marginTop) || 0
  const marginBottom = Number.parseFloat(style.marginBottom) || 0
  return element.getBoundingClientRect().height + marginTop + marginBottom
}

export const paginateElements = (blocks: Element[], availableHeight: number): string[] => {
  const pages: string[] = []
  let pageBlocks: string[] = []
  let usedHeight = 0
  let headingOne = 0
  let headingTwo = 0

  for (const block of blocks) {
    const height = measuredHeight(block)
    const shouldKeepWithNext = /^H[1-6]$/.test(block.tagName)
    const nextHeight = block.nextElementSibling?.getBoundingClientRect().height ?? 0
    const requiredHeight = shouldKeepWithNext ? height + Math.min(nextHeight, KEEP_WITH_NEXT_LIMIT) : height

    if (pageBlocks.length && usedHeight + requiredHeight > availableHeight) {
      pages.push(pageBlocks.join(''))
      pageBlocks = []
      usedHeight = 0
    }

    const paginatedBlock = block.cloneNode(true) as HTMLElement
    if (block.tagName === 'H1') {
      headingOne += 1
      headingTwo = 0
      paginatedBlock.dataset.headingNumber = String(headingOne)
    } else if (block.tagName === 'H2') {
      headingTwo += 1
      paginatedBlock.dataset.headingNumber = `${headingOne}.${headingTwo}`
    }

    pageBlocks.push(paginatedBlock.outerHTML)
    usedHeight += height
  }

  if (pageBlocks.length || pages.length === 0) pages.push(pageBlocks.join(''))
  return pages
}
