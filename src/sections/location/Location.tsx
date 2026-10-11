import { useEffect, useState } from 'react'
import type { Content, LocationSection } from '../../content/schema.ts'
import { Badge } from '../../components/ui/Badge.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { SectionShell } from '../../components/ui/SectionShell.tsx'
import { Reveal } from '../../motion/Reveal.tsx'
import { getOpenStatus } from '../../lib/openNow.ts'
import './Location.css'

type LocationProps = {
  section: LocationSection
  index: number
  total: number
  business: Content['business']
}

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function Location({ section, index, total, business }: LocationProps) {
  const [snapshot, setSnapshot] = useState<{ day: number; status: ReturnType<typeof getOpenStatus> } | null>(null)

  useEffect(() => {
    if (!section.data.showHours || !business?.hours?.length) return

    const update = () => {
      const now = new Date()
      const weekday = new Intl.DateTimeFormat('pt-BR', { timeZone: business.timezone, weekday: 'long' }).format(now)
      const day = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'].indexOf(weekday)
      setSnapshot({ day, status: getOpenStatus(business.hours ?? [], now, business.timezone) })
    }

    update()
    const interval = window.setInterval(update, 60_000)
    return () => window.clearInterval(interval)
  }, [business, section.data.showHours])

  const address = business?.address
  if (!address) return null

  const fullAddress = [address.street, address.district, address.city, address.region, address.postalCode, address.country].join(', ')
  const route = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
  const map = `https://www.google.com/maps?q=${encodeURIComponent(section.data.mapQuery)}&output=embed`

  return (
    <SectionShell id={section.id} tone={section.tone} eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} total={total}>
      <Reveal className="location-grid">
        <div className="location-info">
          {section.placeholder && <Badge />}
          <address className="location-address">
            {address.street}<br />
            {address.district}<br />
            {address.city}, {address.region}<br />
            CEP {address.postalCode}
          </address>
          {section.data.showHours && business?.hours && (
            <div>
              <table className="location-hours">
                <caption>Horário de funcionamento {!business.hoursConfirmed && <span>(horário a confirmar)</span>}</caption>
                <tbody>
                  {[...business.hours].sort((a, b) => (a.day + 6) % 7 - (b.day + 6) % 7).map((hours) => (
                    <tr key={hours.day} aria-current={snapshot?.day === hours.day ? 'date' : undefined}>
                      <th scope="row">{dayNames[hours.day]}</th>
                      <td>{hours.opens} às {hours.closes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {snapshot && <p className="location-status" data-state={snapshot.status.state} role="status">{snapshot.status.text}</p>}
            </div>
          )}
          <div className="location-actions">
            <Button href={route} external>Abra a rota no mapa</Button>
          </div>
        </div>
        {section.data.showMap && (
          <iframe
            className="location-map"
            title={`Mapa da localização: ${address.street}, ${address.city}`}
            src={map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </Reveal>
    </SectionShell>
  )
}
