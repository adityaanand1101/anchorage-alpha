import React, { useEffect, useRef, useState } from 'react'

/* soft light that follows the pointer (very subtle, desktop only) */
export function useSpot() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(pointer:coarse)').matches) return
    let tx = 50, ty = 30, x = 50, y = 30, raf = 0
    const loop = () => {
      x += (tx - x) * 0.07; y += (ty - y) * 0.07
      el.style.setProperty('--mx', x + '%'); el.style.setProperty('--my', y + '%')
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(loop) : 0
    }
    const mv = e => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width) * 100; ty = ((e.clientY - r.top) / r.height) * 100
      if (!raf) raf = requestAnimationFrame(loop)
    }
    el.addEventListener('pointermove', mv)
    return () => { el.removeEventListener('pointermove', mv); cancelAnimationFrame(raf) }
  }, [])
  return ref
}
/* optical logo sizing: squarer marks get more height, wide wordmarks less, so every logo reads the same size */
function fitLogo(i) {
  if (!i) return
  const set = () => {
    const r = i.naturalWidth && i.naturalHeight ? i.naturalWidth / i.naturalHeight : 0
    if (!r) return
    const h = Math.round(Math.min(32, Math.max(18, 40 / Math.sqrt(r))))
    i.style.height = h + 'px'
  }
  if (i.complete) set(); else i.addEventListener('load', set, { once: true })
}
export const Glow = () => <i className="glow" aria-hidden="true" />

/* hero testimonials: two at a time on wide screens, slow cross-fade */
export function HeroVoices({ items }) {
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  const [per, setPer] = useState(2)
  useEffect(() => {
    const f = () => setPer(window.innerWidth >= 900 ? 2 : 1)
    f(); window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  const pages = Math.ceil(items.length / per)
  const cur = Math.min(i, pages - 1)
  useEffect(() => {
    if (hold) return
    const t = setTimeout(() => setI(n => (n + 1) % pages), 6000)
    return () => clearTimeout(t)
  }, [hold, cur, pages])
  return (
    <div className="hv" role="region" aria-roledescription="carousel" aria-label="Our partners, in their words"
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="hv-row">
      <button type="button" className="hv-arrow prev" aria-label="Previous testimonials" onClick={() => setI((cur - 1 + pages) % pages)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div className="hv-stage" aria-live="off">
        {Array.from({ length: pages }, (_, p) => (
          <div key={p} className={`hv-page ${p === cur ? 'on' : ''}`} aria-hidden={p !== cur}>
            {items.slice(p * per, p * per + per).map(q => (
              <figure key={q.name} className="hv-q">
                <blockquote>{q.q}</blockquote>
                <figcaption>
                  <span className="hv-chip"><img ref={fitLogo} src={q.logo} alt={q.name} /></span>
                  <span className="hv-who"><b>{q.who}</b><span dangerouslySetInnerHTML={{ __html: q.role }} /></span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
      <button type="button" className="hv-arrow next" aria-label="Next testimonials" onClick={() => setI((cur + 1) % pages)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
      </div>
      <div className="hv-dots" role="tablist" aria-label="Choose testimonials">
        {Array.from({ length: pages }, (_, p) => <button key={p} type="button" role="tab" aria-selected={p === cur} aria-label={`Testimonials ${p + 1}`} className={p === cur ? 'on' : ''} onClick={() => setI(p)}><i /></button>)}
      </div>
    </div>
  )
}
