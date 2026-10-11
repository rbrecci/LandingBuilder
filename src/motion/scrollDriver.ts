export function supportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('animation-timeline: view()')
    && CSS.supports('animation-range: entry')
}

export function startScrollDriver(root: ParentNode): () => void {
  if (typeof window === 'undefined' || supportsScrollTimeline()) return () => {}

  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'))
  if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return () => {}

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const visible = new Set<HTMLElement>()
  let frame = 0
  let observer: IntersectionObserver | undefined
  let listening = false

  const update = () => {
    frame = 0
    for (const element of visible) {
      const rect = element.getBoundingClientRect()
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      element.style.setProperty('--p', String(Math.max(0, Math.min(1, progress))))
    }
  }
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update)
  }
  const stop = () => {
    if (listening) window.removeEventListener('scroll', schedule)
    listening = false
    observer?.disconnect()
    observer = undefined
    visible.clear()
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
  }
  const start = () => {
    if (reducedMotion?.matches || listening) return
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement
        if (entry.isIntersecting) visible.add(element)
        else visible.delete(element)
      }
      schedule()
    })
    for (const target of targets) observer.observe(target)
    window.addEventListener('scroll', schedule, { passive: true })
    listening = true
  }
  const onMotionChange = () => {
    if (reducedMotion?.matches) stop()
    else start()
  }

  reducedMotion?.addEventListener('change', onMotionChange)
  start()

  return () => {
    reducedMotion?.removeEventListener('change', onMotionChange)
    stop()
  }
}
