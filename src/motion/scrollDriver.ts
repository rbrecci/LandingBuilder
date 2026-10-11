export function supportsScrollTimeline(): boolean {
  const supportsNativeTimeline = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('animation-timeline: view()')
    && CSS.supports('animation-range: entry')
  if (!supportsNativeTimeline) return false
  if (typeof document === 'undefined' || typeof window === 'undefined') return true
  return !Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    .some((target) => hasNestedScrollContainer(target))
}

export function startScrollDriver(root: ParentNode): () => void {
  if (typeof window === 'undefined') return () => {}

  const allTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'))
  const targets = supportsScrollTimeline()
    ? allTargets.filter((target) => hasNestedScrollContainer(target))
    : allTargets
  if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return () => {}
  for (const target of targets) target.setAttribute('data-parallax-driver', '')

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
    for (const target of targets) target.removeAttribute('data-parallax-driver')
  }
}

function hasNestedScrollContainer(element: HTMLElement): boolean {
  let ancestor = element.parentElement
  while (ancestor && ancestor !== document.documentElement) {
    const style = window.getComputedStyle(ancestor)
    if ([style.overflowX, style.overflowY].some((value) => ['auto', 'hidden', 'scroll'].includes(value))) {
      return true
    }
    ancestor = ancestor.parentElement
  }
  return false
}
