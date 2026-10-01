import { defaultSettings } from './settings-store'

describe('document settings', () => {
  it('uses a print-safe default page configuration', () => {
    expect(defaultSettings.paperSize).toBe('a4')
    expect(defaultSettings.orientation).toBe('portrait')
    expect(defaultSettings.marginPreset).toBe('normal')
    expect(defaultSettings.pageNumbers).toBe(true)
  })

  it('uses a registered default theme', () => {
    expect(defaultSettings.theme).toBe('minimal')
  })
})
