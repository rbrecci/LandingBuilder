import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { useCapabilities } from './prefs'

type ParallaxProps = HTMLAttributes<HTMLElement> & {
  as?: keyof HTMLElementTagNameMap
  speed: number
  children?: ReactNode
}

export function Parallax({ as, speed, className, style, children, ...props }: ParallaxProps) {
  const Element = as ?? 'div'
  const { reducedMotion } = useCapabilities()
  const safeSpeed = Math.max(-1, Math.min(1, speed))

  return (
    <Element
      {...props}
      className={['parallax', className].filter(Boolean).join(' ')}
      data-parallax={reducedMotion ? undefined : ''}
      style={{ ...style, '--speed': safeSpeed } as CSSProperties}
    >
      {children}
    </Element>
  )
}
