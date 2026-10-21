import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import DemoStudio from '../components/DemoStudio'

describe('Demo Studio interface', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    Element.prototype.scrollIntoView = vi.fn()
    await i18n.changeLanguage('tr')
  })
  afterEach(() => { cleanup(); vi.useRealTimers() })
  it('preserves the active transcript while translating assistant messages', async () => {
    render(<I18nextProvider i18n={i18n}><DemoStudio sector="legal" onSector={vi.fn()}/></I18nextProvider>)
    fireEvent.click(screen.getByRole('button', { name: /Görüşmeyi Başlat/i }))
    act(() => vi.advanceTimersByTime(400))
    expect(screen.getByText(/hukuk ofisimizin yapay zekâ asistanına/i)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Mesajınızı yazın...' }), { target: { value: 'Dosyamın durumunu öğrenebilir miyim?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    act(() => vi.advanceTimersByTime(400))
    expect(within(screen.getByRole('log')).getByText('Dosyamın durumunu öğrenebilir miyim?')).toBeInTheDocument()
    expect(screen.getByText(/DEMO-01 örnek kimliğini seçin/i)).toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage('en') })
    expect(within(screen.getByRole('log')).getByText('Dosyamın durumunu öğrenebilir miyim?')).toBeInTheDocument()
    expect(screen.getByText(/select the sample identity DEMO-01/i)).toBeInTheDocument()
  })
  it('keeps text input available when speech recognition is unsupported', () => {
    render(<I18nextProvider i18n={i18n}><DemoStudio sector="commerce" onSector={vi.fn()}/></I18nextProvider>)
    fireEvent.click(screen.getByRole('button', { name: /Görüşmeyi Başlat/i }))
    act(() => vi.advanceTimersByTime(400))
    fireEvent.click(screen.getByRole('button', { name: 'Mikrofonu aç' }))
    expect(screen.getByRole('status').textContent).toMatch(/Metinle devam edebilirsiniz/)
    const field = screen.getByRole('textbox', { name: 'Mesajınızı yazın...' })
    expect(field).toBeEnabled()
    fireEvent.change(field, { target: { value: 'ORD-1002' } })
    fireEvent.click(screen.getByRole('button', { name: 'Mesaj gönder' }))
    act(() => vi.advanceTimersByTime(400))
    expect(within(screen.getByRole('log')).getByText(/ORD-1002 örnek siparişi/i)).toBeInTheDocument()
  })
  it('keeps the simulated handoff summary visible', () => {
    render(<I18nextProvider i18n={i18n}><DemoStudio sector="legal" onSector={vi.fn()}/></I18nextProvider>)
    fireEvent.click(screen.getByRole('button', { name: /Görüşmeyi Başlat/i }))
    act(() => vi.advanceTimersByTime(400))
    fireEvent.click(screen.getByRole('button', { name: 'Canlı Temsilciye Aktar' }))
    act(() => vi.advanceTimersByTime(700))
    expect(screen.getByText('Aktarım özeti')).toBeInTheDocument()
    expect(screen.getAllByText('Temsilci aktarımı demo olarak simüle edildi.').length).toBeGreaterThan(0)
  })
})
