import { describe, expect, it } from 'vitest'
import type { Content } from '../../src/content/schema.ts'
import { getOpenStatus } from '../../src/lib/openNow.ts'

type Hours = NonNullable<NonNullable<Content['business']>['hours']>

const hours: Hours = [
  { day: 0, opens: '07:30', closes: '14:00' },
  { day: 1, opens: '07:00', closes: '20:00' },
  { day: 2, opens: '07:00', closes: '20:00' },
  { day: 3, opens: '07:00', closes: '20:00' },
  { day: 4, opens: '07:00', closes: '20:00' },
  { day: 5, opens: '07:00', closes: '20:00' },
  { day: 6, opens: '07:00', closes: '20:00' },
]

describe('getOpenStatus', () => {
  it.each([
    ['2026-10-10T16:00:00Z', 'open', 'Aberto agora, fecha às 20:00'],
    ['2026-10-11T10:29:00Z', 'closed', 'Fechado, abre hoje às 07:30'],
    ['2026-10-11T17:00:00Z', 'closed', 'Fechado, abre amanhã às 07:00'],
    ['2026-10-12T23:00:00Z', 'closed', 'Fechado, abre amanhã às 07:00'],
    ['2026-10-10T23:00:00Z', 'closed', 'Fechado, abre amanhã às 07:30'],
    ['2026-10-12T09:59:00Z', 'closed', 'Fechado, abre hoje às 07:00'],
    ['2026-10-11T11:00:00Z', 'open', 'Aberto agora, fecha às 14:00'],
  ] as const)('%s resulta em %s', (instant, state, text) => {
    expect(getOpenStatus(hours, new Date(instant), 'America/Sao_Paulo')).toEqual({ state, text })
  })

  it('procura o próximo dia quando hoje não tem horário', () => {
    const saturdayOnly: Hours = [{ day: 6, opens: '09:00', closes: '12:00' }]
    expect(getOpenStatus(saturdayOnly, new Date('2026-10-14T13:00:00Z'), 'America/Sao_Paulo'))
      .toEqual({ state: 'closed', text: 'Fechado, abre sábado às 09:00' })
  })

  it('informa que está fechado quando a lista está vazia', () => {
    expect(getOpenStatus([], new Date('2026-10-10T16:00:00Z'), 'America/Sao_Paulo'))
      .toEqual({ state: 'closed', text: 'Fechado agora' })
  })
})
