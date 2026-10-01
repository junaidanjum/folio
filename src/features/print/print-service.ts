import { invoke } from '@tauri-apps/api/core'

export const isDesktopApp = () => Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)

export const openNativePrintDialog = async () => {
  if (!isDesktopApp()) throw new Error('Printing and PDF export are available in the Folio desktop app.')

  const root = window.document.documentElement
  const restorePreview = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('native-print-active')))
  }

  root.classList.add('native-print-active')
  window.addEventListener('afterprint', restorePreview, { once: true })

  try {
    await invoke('print_document')
  } catch (cause) {
    window.removeEventListener('afterprint', restorePreview)
    root.classList.remove('native-print-active')
    throw cause
  }
}
