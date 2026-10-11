import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { useCapabilities } from './prefs'

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
}

export function Reveal({ className, children, ...props }: RevealProps) {
  const element = useRef<HTMLDivElement>(null)
  const { ready, reducedMotion } = useCapabilities()

  useEffect(() => {
    if (!ready || !element.current) return
    const target = element.current
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      target.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        target.classList.add('is-visible')
        observer.disconnect()
      }
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [ready, reducedMotion])

  return <div {...props} ref={element} className={className} data-reveal="">{children}</div>
}
