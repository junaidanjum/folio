// Keep ancestor markup even when a fragment starts and ends inside one text node.
export const textFragments = (element: HTMLElement) => {
  const boundaries = [0]
  for (const character of element.textContent ?? '') boundaries.push(boundaries[boundaries.length - 1] + character.length)

  return {
    count: boundaries.length - 1,
    slice: (start: number, end: number): HTMLElement => {
      const clone = element.cloneNode(true) as HTMLElement
      const from = boundaries[Math.min(start, boundaries.length - 1)]
      const to = boundaries[Math.min(end, boundaries.length - 1)]
      let position = 0
      const trim = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? ''
          const offset = position
          position += text.length
          if (position <= from || offset >= to) node.parentNode?.removeChild(node)
          else node.textContent = text.slice(Math.max(0, from - offset), Math.min(text.length, to - offset))
        } else if (node.childNodes.length) {
          for (const child of Array.from(node.childNodes)) trim(child)
          if (!node.childNodes.length) node.parentNode?.removeChild(node)
        } else if (position < from || position >= to) {
          node.parentNode?.removeChild(node)
        }
      }
      for (const child of Array.from(clone.childNodes)) trim(child)
      return clone
    },
  }
}
