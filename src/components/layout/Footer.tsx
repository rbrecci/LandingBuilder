import type { Content } from '../../content/schema.ts'
import './Footer.css'

type FooterProps = {
  brand: Content['brand']
  business: Content['business']
  footer: Content['footer'] | undefined
}

export function Footer({ brand, business, footer }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <img
            src={brand.logo.src}
            alt={brand.logo.alt}
            width={brand.logo.width}
            height={brand.logo.height}
          />
          <div>
            <strong>{brand.name}</strong>
            <p>{brand.tagline}</p>
          </div>
        </div>

        {business && (business.address || business.phone) && (
          <address className="site-footer__contact">
            {business.address && (
              <span>
                {business.address.street}, {business.address.district}<br />
                {business.address.city}, {business.address.region} {business.address.postalCode}, {business.address.country}
              </span>
            )}
            {business.phone && <a href={`tel:${business.phone}`}>{business.phone}</a>}
          </address>
        )}

        {footer && footer.links.length > 0 && (
          <nav aria-label="Links do rodapé" className="site-footer__links">
            {footer.links.map((link) => <a href={link.to} key={`${link.label}-${link.to}`}>{link.label}</a>)}
          </nav>
        )}
      </div>

      <div className="site-footer__bottom">
        {footer?.legal && <p>{footer.legal}</p>}
        <p>Desenvolvido por <a href="https://github.com/rbrecci" target="_blank" rel="noopener noreferrer">RBrecci</a></p>
      </div>
    </footer>
  )
}
