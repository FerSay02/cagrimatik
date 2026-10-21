export type Sector = 'legal' | 'hotel' | 'sales' | 'commerce'
export type CallStatus = 'idle' | 'connecting' | 'active' | 'listening' | 'processing' | 'speaking' | 'transfer_requested' | 'transferred_demo' | 'ended' | 'error'
export type Message = { id: number; role: 'user' | 'assistant'; text?: string; key?: string; params?: Record<string, string | number> }
export type HotelInput = { checkin: string; checkout: string; guests: number; room: 'standard' | 'deluxe' | 'suite' }
export type RecordData = { kind: 'case' | 'reservation' | 'lead' | 'order' | 'return'; values: Record<string, string | number>; timeline?: string[] }
export type DemoState = { sector: Sector; status: CallStatus; messages: Message[]; intent: string; steps: string[]; events: string[]; record: RecordData | null; stage: string; verified: boolean; outcome: string; startedAt: number | null; hotelQuote: HotelInput | null; hotelTotal: number | null; budget: string; product: string }

export const sectors: Sector[] = ['legal', 'hotel', 'sales', 'commerce']
export const initialDemo = (sector: Sector = 'hotel'): DemoState => ({ sector, status: 'idle', messages: [], intent: '', steps: [], events: [], record: null, stage: '', verified: false, outcome: '', startedAt: null, hotelQuote: null, hotelTotal: null, budget: '', product: '' })
let messageId = 0
const assistant = (key: string, params?: Message['params']): Message => ({ id: ++messageId, role: 'assistant', key, params })
const user = (text: string): Message => ({ id: ++messageId, role: 'user', text })
const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
const has = (s: string, terms: string[]) => terms.some(term => normalize(s).includes(normalize(term)))
const add = (state: DemoState, response: string, params?: Message['params']): DemoState => ({ ...state, status: 'active', messages: [...state.messages, assistant(response, params)] })
const step = (state: DemoState, ...items: string[]) => ({ ...state, steps: [...new Set([...state.steps, ...items])], events: [...new Set([...state.events, ...items])] })

export function startCall(state: DemoState): DemoState {
  return { ...initialDemo(state.sector), status: 'active', startedAt: Date.now(), messages: [assistant(`flows.greeting.${state.sector}`)] }
}

export function endCall(state: DemoState): DemoState {
  if (state.status === 'idle' || state.status === 'ended') return state
  return { ...state, status: 'ended', outcome: state.outcome || 'flows.ended', messages: [...state.messages, assistant('flows.ended')] }
}

export function transferCall(state: DemoState): DemoState {
  if (state.status === 'idle' || state.status === 'ended' || state.status === 'transferred_demo') return state
  const requested = { ...state, status: 'transfer_requested' as CallStatus, intent: state.intent || 'transfer' }
  return { ...step(requested, 'transfer'), status: 'transferred_demo', outcome: 'demo.transferDone', messages: [...state.messages, assistant('flows.transfer')] }
}

export function quoteHotel(state: DemoState, input: HotelInput, now = new Date()): DemoState {
  const start = new Date(`${input.checkin}T12:00:00`)
  const end = new Date(`${input.checkout}T12:00:00`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  if (!Number.isFinite(nights) || start < today || nights < 1 || input.guests < 1 || input.guests > ({ standard: 2, deluxe: 3, suite: 4 })[input.room]) return add({ ...state, stage: 'hotel_details', hotelQuote: null, hotelTotal: null, record: null, outcome: '' }, 'flows.hotelInvalid')
  const base = ({ standard: 2450, deluxe: 3850, suite: 6200 })[input.room]
  const weekend = Array.from({ length: nights }, (_, i) => new Date(start.getTime() + i * 86400000)).filter(d => d.getDay() === 5 || d.getDay() === 6).length
  const total = base * nights + weekend * Math.round(base * .15)
  const ready = step({ ...state, intent: 'booking', stage: 'hotel_ready', hotelQuote: input, hotelTotal: total, record: null, outcome: '' }, 'intent', 'dates')
  return add(ready, 'flows.hotelReady', { room: input.room, nights, price: total })
}

export function sendMessage(state: DemoState, raw: string, lang: 'tr' | 'en'): DemoState {
  const text = raw.trim().slice(0, 500)
  if (!text || !['active', 'listening', 'speaking', 'processing'].includes(state.status)) return state
  const s = normalize(text)
  let next: DemoState = { ...state, messages: [...state.messages, user(text)] }
  if (has(s, ['temsilci', 'canli', 'agent', 'human', 'person'])) return transferCall(next)
  if (state.sector === 'legal') {
    if (s.includes('demo-01')) {
      next = step({ ...next, verified: true, intent: 'case', stage: 'case_ready', record: { kind: 'case', values: { id: 'ICR-2025-1042', amount: 2450 } }, outcome: 'records.case' }, 'intent', 'verify', 'case')
      return add(next, 'flows.legalVerified')
    }
    if (has(s, ['odeme', 'payment', 'pay'])) return add({ ...next, intent: 'payment' }, 'flows.legalPayment')
    if (has(s, ['dosya', 'icra', 'case', 'file', 'status', 'durum'])) return add(step({ ...next, intent: 'case', stage: 'verify' }, 'intent'), state.verified ? 'flows.legalVerified' : 'flows.legalAsk')
  }
  if (state.sector === 'hotel') {
    if (has(s, ['rezervasyon yap', 'book', 'reserve', 'confirm'])) {
      if (state.stage === 'hotel_ready' && state.hotelQuote && state.hotelTotal !== null) return add(step({ ...next, stage: 'hotel_done', outcome: 'records.reservation', record: { kind: 'reservation', values: { id: 'RSV-DEMO-1042', room: state.hotelQuote.room, checkin: state.hotelQuote.checkin, checkout: state.hotelQuote.checkout, guests: state.hotelQuote.guests, total: state.hotelTotal } } }, 'reservation'), 'flows.hotelDone')
      return add({ ...next, intent: 'booking' }, 'flows.hotelAsk')
    }
    if (has(s, ['oda', 'otel', 'musait', 'room', 'hotel', 'available', 'date', 'tarih', 'rezervasyon'])) return add(step({ ...next, intent: 'booking', stage: 'hotel_details' }, 'intent'), 'flows.hotelAsk')
  }
  if (state.sector === 'sales') {
    if (state.stage === 'consent') {
      if (has(s, ['onayliyorum', 'onay', 'i consent', 'yes', 'agree'])) return add(step({ ...next, stage: 'lead_done', outcome: 'records.lead', record: { kind: 'lead', values: { id: 'LEAD-DEMO-1042', product: state.product || 'Starter', budget: state.budget || '—', consent: '✓' } } }, 'consent', 'lead'), 'flows.salesDone')
      if (has(s, ['hayir', 'no', 'decline'])) return add({ ...next, stage: 'offer', outcome: 'flows.salesDeclined' }, 'flows.salesDeclined')
      return add(next, 'flows.salesConsent')
    }
    if (has(s, ['teklif', 'offer', 'quote', 'price', 'fiyat'])) return state.stage === 'offer' ? add(step({ ...next, intent: 'offer', stage: 'consent' }, 'offer'), 'flows.salesConsent') : add({ ...next, intent: 'offer', stage: 'needs' }, 'flows.salesAsk')
    if (has(s, ['urun', 'paket', 'product', 'plan', 'sales', 'satis', 'ihtiyac', 'need', 'budget', 'butce']) || state.stage === 'needs') {
      const budgetMatch = text.match(/\d[\d.,]*(?:\s*(?:tl|₺|try|usd|\$))?/i)
      if (!budgetMatch && !state.budget) return add({ ...next, intent: 'product', stage: 'needs' }, 'flows.salesAsk')
      const budget = budgetMatch?.[0] || state.budget || (lang === 'tr' ? 'belirtilmemiş' : 'unspecified')
      const product = has(s, ['buyuk', 'enterprise', 'ekip', 'team']) ? 'Growth' : 'Starter'
      return add(step({ ...next, intent: 'product', stage: 'offer', budget, product }, 'intent'), 'flows.salesOffer', { product, budget })
    }
  }
  if (state.sector === 'commerce') {
    const match = text.toUpperCase().match(/ORD-\d+/)
    if (match) {
      const order = ({ 'ORD-1001': { status: 'statusPreparing', eta: 'etaSoon', timeline: ['statusPreparing'] }, 'ORD-1002': { status: 'statusShipped', eta: 'etaTomorrow', timeline: ['statusPreparing', 'statusShipped'] }, 'ORD-1003': { status: 'statusDelivered', eta: 'etaDelivered', timeline: ['statusPreparing', 'statusShipped', 'statusOut', 'statusDelivered'] } } as const)[match[0] as 'ORD-1001' | 'ORD-1002' | 'ORD-1003']
      if (!order) return add({ ...next, intent: 'order' }, 'flows.commerceInvalid')
      next = step({ ...next, intent: 'order', stage: 'order_found', record: { kind: 'order', values: { id: match[0], status: order.status, eta: order.eta }, timeline: [...order.timeline] }, outcome: 'records.order' }, 'intent', 'order', 'status')
      return add(next, 'flows.commerceFound', { order: match[0], status: order.status, eta: order.eta })
    }
    if (has(s, ['iade', 'return'])) return add(step({ ...next, intent: 'return', outcome: 'records.return', record: { kind: 'return', values: { id: 'RET-DEMO-1042' } } }, 'return'), 'flows.commerceReturn')
    if (has(s, ['kargo', 'siparis', 'order', 'shipping', 'where', 'nerede', 'track'])) return add(step({ ...next, intent: 'order', stage: 'order_needed' }, 'intent'), 'flows.commerceAsk')
  }
  return add({ ...next, intent: next.intent || 'unknown' }, `flows.fallback.${state.sector}`)
}
