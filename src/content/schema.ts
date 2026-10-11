import { z } from 'zod'
import { collectLinkErrors } from './links.ts'

const nonEmpty = z.string().trim().min(1)
const localSrc = z.string().startsWith('/client/')
const imageSchema = z.object({
  src: localSrc,
  alt: nonEmpty,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

const modelCommon = {
  poster: imageSchema,
  alt: nonEmpty,
  interaction: z.enum(['both', 'pointer', 'scroll', 'none']).default('both'),
  mobile: z.enum(['scroll', 'still']).default('scroll'),
  maxTiltDeg: z.number().min(0).max(35).default(18),
}

const modelSchema = z.discriminatedUnion('kind', [
  z.object({
    ...modelCommon,
    kind: z.literal('medal'),
    medal: z.object({ texture: localSrc.regex(/\.(png|webp)$/i), thickness: z.number().positive() }),
  }),
  z.object({
    ...modelCommon,
    kind: z.literal('glb'),
    glb: z.object({
      src: localSrc.endsWith('.glb'),
      scale: z.number().positive(),
      rotation: z.tuple([z.number(), z.number(), z.number()]),
    }),
  }),
])

export type ModelConfig = z.infer<typeof modelSchema>

const linkSchema = z.object({ label: nonEmpty, to: nonEmpty })
const sectionId = (type: string) => z.string().regex(/^[a-z][a-z0-9-]*$/).default(type)
const sectionCommon = {
  enabled: z.boolean().default(true),
  navLabel: nonEmpty.optional(),
  tone: z.enum(['dark', 'light', 'brand', 'accent']).default('light'),
  eyebrow: nonEmpty.optional(),
  title: nonEmpty.max(80),
  intro: z.string().max(280).optional(),
  placeholder: z.boolean().default(false),
  parallax: z.enum(['off', 'subtle', 'bold']).optional(),
}

const heroSchema = z.object({
  ...sectionCommon,
  id: sectionId('hero'),
  type: z.literal('hero'),
  enabled: z.literal(true).default(true),
  data: z.object({
    headline: nonEmpty.max(60),
    subheadline: nonEmpty.max(160),
    ctas: z.array(linkSchema.extend({ variant: nonEmpty })).min(1).max(2),
    model: modelSchema,
    layers: z.array(z.object({ src: localSrc, speed: z.number() })).max(3).default([]),
    status: z.boolean().default(false),
  }),
})

const statsSchema = z.object({
  ...sectionCommon, id: sectionId('stats'), type: z.literal('stats'),
  data: z.object({ items: z.array(z.object({ value: nonEmpty, label: nonEmpty, note: nonEmpty.optional() })).min(2).max(4) }),
})

const aboutSchema = z.object({
  ...sectionCommon, id: sectionId('about'), type: z.literal('about'),
  data: z.object({ paragraphs: z.array(nonEmpty).min(1).max(3), image: imageSchema, highlight: z.object({ value: nonEmpty, label: nonEmpty }).optional() }),
})

const featuresSchema = z.object({
  ...sectionCommon, id: sectionId('features'), type: z.literal('features'),
  data: z.object({ items: z.array(z.object({ title: nonEmpty, text: nonEmpty, image: imageSchema.optional() })).min(3).max(6) }),
})

const showcase3dSchema = z.object({
  ...sectionCommon, id: sectionId('showcase3d'), type: z.literal('showcase3d'),
  data: z.object({ model: modelSchema, caption: nonEmpty, controls: z.boolean() }),
})

const gallerySchema = z.object({
  ...sectionCommon, id: sectionId('gallery'), type: z.literal('gallery'),
  data: z.object({ items: z.array(imageSchema.extend({ caption: nonEmpty })).min(3).max(8) }),
})

const offersSchema = z.object({
  ...sectionCommon, id: sectionId('offers'), type: z.literal('offers'),
  data: z.object({
    items: z.array(z.object({ name: nonEmpty, price: nonEmpty, unit: nonEmpty, tag: nonEmpty.optional(), validUntil: nonEmpty.optional() })).min(2).max(6),
    note: nonEmpty,
  }),
})

const testimonialsSchema = z.object({
  ...sectionCommon, id: sectionId('testimonials'), type: z.literal('testimonials'),
  data: z.object({
    items: z.array(z.object({ quote: nonEmpty, author: nonEmpty, role: nonEmpty.optional() })).min(2).max(4),
    consentConfirmed: z.boolean(),
  }),
})

const faqSchema = z.object({
  ...sectionCommon, id: sectionId('faq'), type: z.literal('faq'),
  data: z.object({ items: z.array(z.object({ question: nonEmpty, answer: nonEmpty })).min(3).max(8) }),
})

const locationSchema = z.object({
  ...sectionCommon, id: sectionId('location'), type: z.literal('location'),
  data: z.object({ showMap: z.boolean(), mapQuery: nonEmpty, showHours: z.boolean() }),
})

const contactSchema = z.object({
  ...sectionCommon, id: sectionId('contact'), type: z.literal('contact'),
  data: z.object({ channels: z.array(z.enum(['phone', 'whatsapp', 'email', 'instagram'])), closing: nonEmpty }),
})

const sectionSchema = z.discriminatedUnion('type', [
  heroSchema, statsSchema, aboutSchema, featuresSchema, showcase3dSchema, gallerySchema,
  offersSchema, testimonialsSchema, faqSchema, locationSchema, contactSchema,
])

export type Section = z.infer<typeof sectionSchema>
export type HeroSection = Extract<Section, { type: 'hero' }>
export type StatsSection = Extract<Section, { type: 'stats' }>
export type AboutSection = Extract<Section, { type: 'about' }>
export type FeaturesSection = Extract<Section, { type: 'features' }>
export type Showcase3dSection = Extract<Section, { type: 'showcase3d' }>
export type GallerySection = Extract<Section, { type: 'gallery' }>
export type OffersSection = Extract<Section, { type: 'offers' }>
export type TestimonialsSection = Extract<Section, { type: 'testimonials' }>
export type FaqSection = Extract<Section, { type: 'faq' }>
export type LocationSection = Extract<Section, { type: 'location' }>
export type ContactSection = Extract<Section, { type: 'contact' }>

const businessSchema = z.object({
  schemaType: z.enum(['LocalBusiness', 'Restaurant', 'Store', 'SportsClub', 'Organization']),
  address: z.object({
    street: nonEmpty, district: nonEmpty, city: nonEmpty, region: nonEmpty,
    postalCode: nonEmpty, country: nonEmpty,
  }).optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
  whatsapp: z.string().regex(/^[1-9]\d+$/).optional(),
  email: z.email().optional(),
  social: z.array(z.object({ network: nonEmpty, url: z.url().startsWith('https://') })).default([]),
  timezone: nonEmpty,
  hours: z.array(z.object({
    day: z.number().int().min(0).max(6),
    opens: z.string().regex(/^\d{2}:\d{2}$/),
    closes: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional(),
  hoursConfirmed: z.boolean().default(false),
})

const contentBaseSchema = z.object({
  $schema: z.string().optional(),
  schemaVersion: z.literal(1),
  site: z.object({
    lang: z.literal('pt-BR'),
    title: nonEmpty.min(10).max(70),
    description: nonEmpty.min(50).max(160),
    url: z.url().startsWith('https://').optional(),
    indexable: z.boolean().default(false),
    ogImage: localSrc,
    favicon: localSrc,
    demoBanner: z.object({ enabled: z.boolean(), text: nonEmpty }),
  }),
  brand: z.object({ name: nonEmpty, shortName: nonEmpty, tagline: nonEmpty, logo: imageSchema }),
  business: businessSchema.optional(),
  nav: z.object({ cta: linkSchema }),
  sections: z.array(sectionSchema),
  footer: z.object({ legal: z.string().optional(), links: z.array(linkSchema) }),
})

export type Content = z.infer<typeof contentBaseSchema>

export const contentSchema = contentBaseSchema.superRefine((content, ctx) => {
  if (content.sections[0]?.type !== 'hero') {
    ctx.addIssue({ code: 'custom', path: ['sections', 0], message: 'A primeira seção deve ser hero.' })
  }

  const ids = new Set<string>()
  content.sections.forEach((section, index) => {
    if (ids.has(section.id)) ctx.addIssue({ code: 'custom', path: ['sections', index, 'id'], message: `ID duplicado: ${section.id}` })
    ids.add(section.id)

    if (section.type === 'hero' && index !== 0) {
      ctx.addIssue({ code: 'custom', path: ['sections', index], message: 'Hero deve ser a primeira seção.' })
    }
    if (section.type === 'testimonials' && !section.data.consentConfirmed && !section.placeholder) {
      ctx.addIssue({ code: 'custom', path: ['sections', index, 'placeholder'], message: 'Depoimentos sem consentimento exigem placeholder.' })
    }
    if (section.type === 'location') {
      if (!content.business?.address) ctx.addIssue({ code: 'custom', path: ['business', 'address'], message: 'Localização exige endereço.' })
      if (section.data.showHours && !content.business?.hours?.length) ctx.addIssue({ code: 'custom', path: ['business', 'hours'], message: 'Horários ativados exigem horas de funcionamento.' })
    }
    if (section.type === 'contact') {
      if (!content.business) {
        ctx.addIssue({ code: 'custom', path: ['business'], message: 'Contato exige dados do negócio.' })
      } else {
        const channels = section.data.channels
        if (channels.includes('phone') && !content.business.phone) ctx.addIssue({ code: 'custom', path: ['business', 'phone'], message: 'Canal de telefone exige número.' })
        if (channels.includes('whatsapp') && !content.business.whatsapp) ctx.addIssue({ code: 'custom', path: ['business', 'whatsapp'], message: 'Canal de WhatsApp exige número.' })
        if (channels.includes('email') && !content.business.email) ctx.addIssue({ code: 'custom', path: ['business', 'email'], message: 'Canal de email exige endereço.' })
        if (channels.includes('instagram') && !content.business.social.some((social) => social.network === 'instagram')) {
          ctx.addIssue({ code: 'custom', path: ['business', 'social'], message: 'Canal de Instagram exige perfil.' })
        }
      }
    }
    if (section.type === 'hero' && section.data.status && !content.business?.hours?.length) {
      ctx.addIssue({ code: 'custom', path: ['business', 'hours'], message: 'Status exige horas de funcionamento.' })
    }
  })

  collectLinkErrors(content).forEach((message) => ctx.addIssue({ code: 'custom', path: [], message }))
})
