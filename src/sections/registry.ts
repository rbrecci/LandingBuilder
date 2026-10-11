import { createElement } from 'react'
import type { Content, Section } from '../content/schema.ts'
import { Hero } from './hero/Hero.tsx'
import { Stats } from './stats/Stats.tsx'
import { About } from './about/About.tsx'
import { Features } from './features/Features.tsx'
import { Showcase3d } from './showcase3d/Showcase3d.tsx'
import { Gallery } from './gallery/Gallery.tsx'
import { Offers } from './offers/Offers.tsx'
import { Testimonials } from './testimonials/Testimonials.tsx'
import { Faq } from './faq/Faq.tsx'
import { Location } from './location/Location.tsx'
import { Contact } from './contact/Contact.tsx'

export function renderSection(section: Section, index: number, total: number, content: Content) {
  switch (section.type) {
    case 'hero':
      return createElement(Hero, { section, index, total, sections: content.sections, business: content.business })
    case 'stats':
      return createElement(Stats, { section, index, total })
    case 'about':
      return createElement(About, { section, index, total })
    case 'features':
      return createElement(Features, { section, index, total })
    case 'showcase3d':
      return createElement(Showcase3d, { section, index, total })
    case 'gallery':
      return createElement(Gallery, { section, index, total })
    case 'offers':
      return createElement(Offers, { section, index, total })
    case 'testimonials':
      return createElement(Testimonials, { section, index, total })
    case 'faq':
      return createElement(Faq, { section, index, total })
    case 'location':
      if (!content.business) throw new Error('Localização exige dados do negócio.')
      return createElement(Location, { section, index, total, business: content.business })
    case 'contact':
      if (!content.business) throw new Error('Contato exige dados do negócio.')
      return createElement(Contact, { section, index, total, business: content.business })
  }
}
