import type { ReactNode } from 'react'
import { stripCalloutMarker, type CalloutType } from './callout-utils'

export const Callout = ({ children, type }: { children: ReactNode; type: CalloutType }) => (
  <blockquote className={`callout callout-${type}`}>
    <span className="callout-label">{type}</span>
    {stripCalloutMarker(children, { removed: false })}
  </blockquote>
)
