import type { Content } from '../content/schema.ts'

type Hours = NonNullable<NonNullable<Content['business']>['hours']>
type OpenStatus = { state: 'open' | 'closed'; text: string }

const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

function minutesOf(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN
}

export function getOpenStatus(hours: readonly Hours[number][], now: Date, timezone: string): OpenStatus {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''
  const day = dayNames.indexOf(part('weekday'))
  const minutes = Number(part('hour')) * 60 + Number(part('minute'))
  const validHours = hours.filter(({ day: weekday, opens, closes }) =>
    weekday >= 0 && weekday <= 6 && minutesOf(opens) < minutesOf(closes),
  )
  const today = validHours.find((item) => item.day === day)

  if (today && minutes >= minutesOf(today.opens) && minutes < minutesOf(today.closes)) {
    return { state: 'open', text: `Aberto agora, fecha às ${today.closes}` }
  }

  if (today && minutes < minutesOf(today.opens)) {
    return { state: 'closed', text: `Fechado, abre hoje às ${today.opens}` }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = (day + offset) % 7
    const next = validHours.find((item) => item.day === nextDay)
    if (next) {
      const when = offset === 1 ? 'amanhã' : offset === 7 ? 'em 7 dias' : dayNames[nextDay]
      return { state: 'closed', text: `Fechado, abre ${when} às ${next.opens}` }
    }
  }

  return { state: 'closed', text: 'Fechado agora' }
}
