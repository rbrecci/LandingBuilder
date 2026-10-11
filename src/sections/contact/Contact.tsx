import type { Content, ContactSection } from '../../content/schema.ts'
import { resolveLink } from '../../content/links.ts'
import { Badge } from '../../components/ui/Badge.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { SectionShell } from '../../components/ui/SectionShell.tsx'
import { Reveal } from '../../motion/Reveal.tsx'
import './Contact.css'

type ContactProps = {
  section: ContactSection
  index: number
  total: number
  business: Content['business']
}

export function Contact({ section, index, total, business }: ContactProps) {
  const channels = section.data.channels.flatMap((channel) => {
    if (channel === 'phone' && business?.phone) return [{ label: 'Ligar', to: `tel:${business.phone}` }]
    if (channel === 'whatsapp' && business?.whatsapp) return [{ label: 'WhatsApp', to: `wa:${business.whatsapp}` }]
    if (channel === 'email' && business?.email) return [{ label: 'Enviar e-mail', to: `mailto:${business.email}` }]
    if (channel === 'instagram') {
      const profile = business?.social.find((item) => item.network === 'instagram')
      if (profile) return [{ label: 'Instagram', to: profile.url }]
    }
    return []
  })

  return (
    <SectionShell id={section.id} tone={section.tone} eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} total={total}>
      <Reveal className="contact-content">
        {section.placeholder && <Badge />}
        {channels.length > 0 && (
          <div className="contact-channels">
            {channels.map(({ label, to }) => {
              const link = resolveLink(to, { sections: [] })
              return <Button key={to} href={link.href} external={link.external} variant="outline">{label}</Button>
            })}
          </div>
        )}
        <p className="contact-closing">{section.data.closing}</p>
      </Reveal>
    </SectionShell>
  )
}
