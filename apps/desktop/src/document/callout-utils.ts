import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

const CALLOUT_MARKER = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i

export type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const extractText = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      if (isValidElement<{ children?: ReactNode }>(child)) return extractText(child.props.children)
      return ''
    })
    .join('')

export const stripCalloutMarker = (node: ReactNode, state: { removed: boolean }): ReactNode =>
  Children.map(node, (child) => {
    if (!state.removed && typeof child === 'string') {
      const nextChild = child.replace(CALLOUT_MARKER, '')
      if (nextChild !== child) state.removed = true
      return nextChild
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, undefined, stripCalloutMarker(child.props.children, state))
    }

    return child
  })

export const getCalloutType = (children: ReactNode): CalloutType | null => {
  const match = CALLOUT_MARKER.exec(extractText(children))
  return match ? (match[1].toLowerCase() as CalloutType) : null
}
