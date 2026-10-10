import React, { useEffect, useRef, useState } from 'react'

export const Split = ({ text, as: T = 'h2', className = '', seenRef }) => {
  const [ref, seen] = seenRef
  return (
    <T ref={ref} className={`${className} split-w ${seen ? 'in' : ''}`} aria-label={text}>
      {text.split(' ').map((w, i) => <span className="w" aria-hidden="true" key={i}><span style={{ '--i': i }}>{w}&nbsp;</span></span>)}
    </T>
  )
}

/* Depth gauge: steps down through six stops, one per approach point */
const STOPS = [1000, 2500, 4000, 6000, 8000, 10000]
const posOf = i => 8 + i * (84 / 5)
export function DepthMeter() {
  const [step, setStep] = useState(0)
  const [on, setOn] = useState(false)
  const [shown, setShown] = useState(STOPS[0])
  const cur = useRef(STOPS[0])
  useEffect(() => {
    const el = document.getElementById('approach')
    if (!el) return
    let raf = 0
    const f = () => {
      raf = 0
      const r = el.getBoundingClientRect(), vh = window.innerHeight
      const vis = r.top < vh * 0.12 && r.bottom > vh * 0.7
      const pinned = getComputedStyle(el.firstElementChild).position === 'sticky'
      const p = pinned ? Math.min(0.999, Math.max(0, (-r.top) / Math.max(1, r.height - vh))) : 0
      const s = Math.min(5, Math.floor(p * 6))
      el.dataset.step = s
      el.style.setProperty('--ap', p.toFixed(4))
      setOn(vis); setStep(s)
    }
    const h = () => { if (!raf) raf = requestAnimationFrame(f) }
    window.addEventListener('scroll', h, { passive: true }); window.addEventListener('resize', h); f()
    return () => { window.removeEventListener('scroll', h); window.removeEventListener('resize', h) }
  }, [])
  useEffect(() => {
    let raf = 0
    const to = STOPS[step]
    const tick = () => {
      cur.current += (to - cur.current) * 0.12
      if (Math.abs(to - cur.current) < 6) cur.current = to
      setShown(Math.round(cur.current / 10) * 10)
      if (cur.current !== to) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step])
  const fmt = n => n.toLocaleString('en-US')
  return (
    <div className={`depth ${on ? 'on' : ''}`} aria-hidden="true">
      <div className="d-track">
        <span className="d-tick" style={{ top: '0%' }}><em>0 m</em></span>
        {STOPS.map((m, i) => <span key={m} className={`d-tick ${i === step ? 'act' : ''} ${i < step ? 'past' : ''}`} style={{ top: posOf(i) + '%' }}><em>{fmt(m)} m</em></span>)}
        <i className="d-fill" style={{ height: posOf(step) + '%' }} />
        <b className="d-mk" style={{ top: posOf(step) + '%' }}><span>{fmt(shown)} m</span></b>
      </div>
    </div>
  )
}
