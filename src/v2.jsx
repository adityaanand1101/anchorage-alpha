import React, { useEffect, useRef, useState } from 'react'

export const Split = ({ text, as: T = 'h2', className = '', seenRef }) => {
  const [ref, seen] = seenRef
  return (
    <T ref={ref} className={`${className} split-w ${seen ? 'in' : ''}`} aria-label={text}>
      {text.split(' ').map((w, i) => <span className="w" aria-hidden="true" key={i}><span style={{ '--i': i }}>{w}&nbsp;</span></span>)}
    </T>
  )
}

/* Fixed depth gauge: 0 m to 4000 m while the Approach section scrolls through */
export function DepthMeter() {
  const [d, setD] = useState(0)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = document.getElementById('approach')
    if (!el) return
    let raf = 0
    const f = () => {
      raf = 0
      const r = el.getBoundingClientRect(), vh = window.innerHeight
      const vis = r.top < vh * 0.5 && r.bottom > vh * 0.85
      const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / Math.max(1, r.height - vh * 0.85)))
      setOn(vis); setD(Math.round(p * 10000 / 50) * 50)
    }
    const h = () => { if (!raf) raf = requestAnimationFrame(f) }
    window.addEventListener('scroll', h, { passive: true }); window.addEventListener('resize', h); f()
    return () => { window.removeEventListener('scroll', h); window.removeEventListener('resize', h) }
  }, [])
  return (
    <div className={`depth ${on ? 'on' : ''}`} aria-hidden="true">
      <div className="d-track">
        {[0, 2000, 4000, 6000, 8000, 10000].map(m => <span key={m} className="d-tick" style={{ top: m / 100 + '%' }}><em>{m.toLocaleString('en-US')} m</em></span>)}
        <i className="d-fill" style={{ height: d / 100 + '%' }} />
        <b className="d-mk" style={{ top: d / 100 + '%' }}><span>{d.toLocaleString('en-US')} m</span></b>
      </div>
    </div>
  )
}
