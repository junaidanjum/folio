import type { MouseEvent as ReactMouseEvent } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { isDesktopApp } from '../print/print-service'

export const startWindowDrag = async (event: ReactMouseEvent<HTMLElement>) => {
  const target = event.target as HTMLElement
  if (event.button !== 0 || target.closest('button, input, select, textarea, a, [role="button"]') || !isDesktopApp()) return

  try {
    await getCurrentWindow().startDragging()
  } catch {
    // Dragging is a progressive native enhancement; controls remain usable if the host rejects it.
  }
}
