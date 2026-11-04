import { invoke } from '@tauri-apps/api/core'
import { openNativePrintDialog } from './print-service'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))

beforeEach(() => {
  vi.mocked(invoke).mockReset()
  Object.defineProperty(window, '__TAURI_INTERNALS__', { configurable: true, value: {} })
  document.body.innerHTML = '<main class="preview-viewport" data-pagination-state="ready"></main>'
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 0
  })
})
afterEach(() => {
  Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
  document.documentElement.classList.remove('native-print-active')
  vi.unstubAllGlobals()
})

it.each(['pending', 'error'])('blocks printing when pagination is %s', async (state) => {
  document.querySelector<HTMLElement>('main')!.dataset.paginationState = state
  await expect(openNativePrintDialog()).rejects.toThrow('page layout')
  expect(invoke).not.toHaveBeenCalled()
})

it('opens the native print dialog and restores preview state', async () => {
  await openNativePrintDialog()
  expect(invoke).toHaveBeenCalledWith('print_document')
  expect(document.documentElement).not.toHaveClass('native-print-active')
})

it('restores preview state on native errors', async () => {
  vi.mocked(invoke).mockRejectedValueOnce(new Error('Printer unavailable'))
  await expect(openNativePrintDialog()).rejects.toThrow('Printer unavailable')
  expect(document.documentElement).not.toHaveClass('native-print-active')
})
