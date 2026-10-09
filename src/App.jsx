import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import C0 from './content.json'

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const U = p => BASE + p
const withBase = v => {
  if (typeof v === 'string') return v.charCodeAt(0) === 47 ? BASE + v : v
  if (Array.isArray(v)) return v.map(withBase)
  if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = withBase(v[k]); return o }
  return v
}
const C = withBase(C0)

const NAV = [['top','Home'],['about','About us'],['legacy','Legacy'],['team','Team'],['approach','Approach'],['portfolio','Investments'],['investors','Investors'],['contact','Contact']]
const html = (h) => ({ dangerouslySetInnerHTML: { __html: h } })
let lenis
const goTo = (id) => lenis ? lenis.scrollTo(id === 'top' ? 0 : '#' + id, { duration: window.paused ? 0 : 1.6, easing: t => 1 - Math.pow(1 - t, 4) }) : document.getElementById(id)?.scrollIntoView({ behavior: window.paused ? 'auto' : 'smooth' })

/* in-view toggle used by every reveal */
function useSeen(margin = '0px 0px -12% 0px') {
  const ref = useRef(), [seen, set] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { set(true); return }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (set(true), io.disconnect()), { rootMargin: margin })
    io.observe(el); return () => io.disconnect()
  }, [margin])
  return [ref, seen]
}
const Rv = ({ as: T = 'div', d = 0, className = '', children, style, ...p }) => {
  const [ref, seen] = useSeen()
  return <T ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ '--d': d + 'ms', ...style }} {...p}>{children}</T>
}
/* keeps Tab inside an open drawer or dialog */
function useTrap(on, ref) {
  useEffect(() => {
    if (!on) return
    const el = ref.current
    if (!el) return
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
    const k = e => {
      if (e.key !== 'Tab') return
      const f = el.querySelectorAll(sel)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (document.activeElement === last || !el.contains(document.activeElement))) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [on, ref])
}
const Unveil = ({ src, alt, className = '' }) => {
  const [ref, seen] = useSeen()
  return <figure ref={ref} className={`unveil ${seen ? 'in' : ''} ${className}`}><img src={src} alt={alt} loading="lazy" /></figure>
}
const Label = ({ children }) => { const [ref, seen] = useSeen(); return <div ref={ref} className={`label ${seen ? 'in' : ''}`}><span>{children}</span><i /></div> }
const SecLabel = ({ children }) => <div className="slabel"><span>{children}</span><i aria-hidden="true" /></div>
function Count({ html: h }) {
  const m = h.match(/^(\D*)(\d+)(.*)$/s); const [ref, seen] = useSeen('0px'); const [n, setN] = useState(0)
  useEffect(() => {
    if (!seen || !m) return; const to = +m[2]
    if (window.paused) { setN(to); return }
    const t0 = performance.now(); let r
    const f = (t) => { const k = Math.min(1, (t - t0) / 1800); setN(Math.round(to * (1 - Math.pow(1 - k, 4)))); k < 1 && (r = requestAnimationFrame(f)) }
    r = requestAnimationFrame(f); return () => cancelAnimationFrame(r)
  }, [seen])
  if (!m) return <b {...html(h)} />
  return <b ref={ref}><span aria-hidden="true">{m[1]}{n}</span><span className="vh">{m[1]}{m[2]}</span><span className="sfx" {...html(m[3])} /></b>
}

/* Hero video: two stacked players, the next one fades in over the last 1.4s of the current one */
function LoopVideo() {
  const A = useRef(), B = useRef()
  useEffect(() => {
    const a = A.current, b = B.current
    if (!a || !b) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const F = 1.4
    let cur = a, nxt = b, busy = false, raf = 0, timer = 0, guard = 0, seen = true, swapId = 0
    const play = v => { try { const r = v.play(); if (r && r.catch) r.catch(() => {}) } catch (e) {} }
    const seek = (v, t) => { try { v.currentTime = t } catch (e) {} }
    const decoded = v => new Promise(res => {
      if (v.readyState >= 3) return res()
      let done = false
      const ok = () => { if (done) return; done = true; v.removeEventListener('canplay', ok); clearTimeout(guard); res() }
      v.addEventListener('canplay', ok)
      guard = setTimeout(ok, 2500)
    })
    play(a)
    const tick = () => {
      const live = seen && !document.hidden && !window.paused
      if (live && !busy && cur.duration && cur.currentTime >= cur.duration - F) {
        busy = true
        const old = cur, id = ++swapId
        seek(nxt, 0)
        decoded(nxt).then(() => {
          if (id !== swapId || !seen || document.hidden) { busy = false; return }
          play(nxt)
          nxt.style.zIndex = '2'; old.style.zIndex = '1'
          nxt.classList.add('on')
          timer = setTimeout(() => {
            old.pause(); old.classList.remove('on')
            seek(old, 0)
            cur = nxt; nxt = old; busy = false
          }, F * 1000 + 80)
        })
      } else if (live && cur.ended) {
        seek(cur, 0); play(cur)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting
      if (seen) play(cur); else { try { cur.pause(); nxt.pause() } catch (e) {} }
    }, { threshold: 0.01 })
    io.observe(a)
    const onVis = () => { if (document.hidden) { cur.pause(); nxt.pause() } else if (seen) play(cur) }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); clearTimeout(guard); io.disconnect(); document.removeEventListener('visibilitychange', onVis); a.pause(); b.pause() }
  }, [])
  const p = { muted: true, playsInline: true, preload: 'auto', poster: U('/video/poster.jpg'), 'aria-hidden': true, disablePictureInPicture: true }
  return <div className="vid"><video ref={A} className="on" {...p}><source src={U('/video/hero.mp4')} type="video/mp4" /></video><video ref={B} {...p}><source src={U('/video/hero.mp4')} type="video/mp4" /></video></div>
}

/* Background video that only runs while on screen and degrades to the poster if it fails */
function BgVideo({ src, poster }) {
  const ref = useRef(), [live, setLive] = useState(true)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return }
    const play = () => { try { const r = v.play(); if (r && r.catch) r.catch(() => {}) } catch (e) {} }
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? (play()) : v.pause() }, { threshold: 0.01 })
    io.observe(v)
    const onVis = () => { document.hidden ? v.pause() : play() }
    document.addEventListener('visibilitychange', onVis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  if (!live) return null
  return <video ref={ref} src={src} poster={poster} muted loop playsInline autoPlay preload="metadata" disablePictureInPicture onError={() => setLive(false)} />
}

function Nav({ active, solid }) {
  const [open, setOpen] = useState(false), refs = useRef({}), [ind, setInd] = useState({ x: 0, w: 0 })
  useLayoutEffect(() => {
    const move = () => { const el = refs.current[active]; el && setInd({ x: el.offsetLeft, w: el.offsetWidth }) }
    move(); addEventListener('resize', move); document.fonts?.ready.then(move); return () => removeEventListener('resize', move)
  }, [active])
  const go = (id) => (e) => { e.preventDefault(); setOpen(false); setTimeout(() => goTo(id), open ? 350 : 0) }
  return (
    <header className={`nav ${solid ? 'solid' : ''} ${open ? 'open' : ''}`}>
      <a href="#top" className="brand" onClick={go('top')} aria-label="Anchorage Alpha, back to top"><i /></a>
      <nav className="links" aria-label="Sections">
        {NAV.map(([id, l]) => <a key={id} href={'#' + id} ref={el => refs.current[id] = el} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined} onClick={go(id)}>{l}</a>)}
        <span className="ind" style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} />
      </nav>
      <button className="burger" aria-expanded={open} onClick={() => setOpen(!open)}><span>{open ? 'Close' : 'Menu'}</span></button>
      <div className="sheet" aria-hidden={!open}>{NAV.map(([id, l]) => <a key={id} href={'#' + id} onClick={go(id)} tabIndex={open ? 0 : -1}>{l}</a>)}</div>
      <b className="prog" />
    </header>
  )
}

const Hero = () => (
  <section id="top" className="hero">
    <LoopVideo /><div className="scrim" />
    <div className="hero-in">
      <img className="hero-logo a11y-keep" src={U('/img/logo-white.png')} alt="Anchorage Alpha" />
      <p className="hero-line">Anchored in Insight.<br/>Steered by Purpose.</p>
    </div>
    <button className="cue" onClick={() => goTo('about')} aria-label="Scroll to About us"><i /></button>
  </section>
)

const About = () => { const a = C.about; return (
  <section id="about" className="sec">
    <div className="wrap">
      <Label>About us</Label>
      <div className="two">
        <div>
          <Rv as="h2" className="h2">{a.h}</Rv>
          {a.p.map((p, i) => <Rv key={i} as="p" d={120 * (i + 1)} className="lede" {...html(p)} />)}
        </div>
        <Unveil src={a.img} alt="Sunrise over calm water" className="tall" />
      </div>
      <SecLabel>Our schemes</SecLabel>
      <div className="schemes">
        {a.schemes.map((s, i) => { const aum = /AUM/.test(s.l), [usd, inr] = s.n.replace('*', '').split('\u20B9'); const date = s.d.replace(/^Inception\s*/, ''); return (
          <Rv key={i} d={i * 90} className={`scheme ${aum ? 'aum' : ''}`}>
            <span className="k">{s.l}</span>
            {aum
              ? <><span className="big"><span className="val">{usd.trim()}<sup>*</sup></span><i className="vsep" aria-hidden="true" /><span className="inr">{'\u20B9'}{inr}</span></span></>
              : <span className="big">{s.n}</span>}
            <span className="sdiv" aria-hidden="true" />
            <span className="sfoot">
              <span className="foot-k">{aum ? s.d : 'Inception'}</span>
              {!aum && <span className="foot-v">{date}</span>}
            </span>
          </Rv>) })}
      </div>
      <p className="note" {...html(a.note)} />
    </div>
  </section>) }

const Legacy = () => { const l = C.legacy, f = C.founder; return (
  <section id="legacy" className="sec tint">
    <div className="wrap">
      <Label>Legacy</Label>
      <div className="two flip">
        <Unveil src={l.img} alt="A stone loggia opening onto calm water at sunset" className="wide" />
        <div>
          <Rv as="h2" className="h2">{l.h}</Rv>
          <Rv as="p" d={100} className="sub-h">{l.sub}</Rv>
          {l.p.map((p, i) => <Rv key={i} as="p" d={160 + i * 100} className="lede">{p}</Rv>)}
        </div>
      </div>
      <div className="stats">{l.stats.map((s, i) => <div key={i} className="stat"><Count html={s.b} /><span>{s.s}</span>{s.e && <em>{s.e}</em>}</div>)}</div>
      <p className="note">* Assets under management of the sponsor group and the Kothari family office, including listed and unlisted holdings.</p>
      <div className="founder">
        <Unveil src={f.img} alt={f.name} className="portrait" />
        <div>
          <Label>{f.role}</Label>
          <Rv as="h3" className="h3">{f.name}</Rv>
          {f.p.map((p, i) => <Rv key={i} as="p" d={i * 100} className="body">{p}</Rv>)}
          <div className="chips">{f.chips.map(c => <span key={c}>{c}</span>)}</div>
        </div>
      </div>
    </div>
  </section>) }

function Team() {
  const [p, setP] = useState(null)
  const panel = useRef()
  useTrap(!!p, panel)
  useEffect(() => { p ? lenis?.stop() : lenis?.start(); const k = e => e.key === 'Escape' && setP(null); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [p])
  return (
    <section id="team" className="sec">
      <div className="wrap">
        <Label>Team</Label>
        <div className="head2">
          <Rv as="h2" className="h2">One shared network.<sup>*</sup></Rv>
          <Rv as="p" d={120} className="lede">Led by Rohit Kothari, Founder &amp; Executive Chairman, our specialists cover every major sector. Select a name to read more.</Rv>
        </div>
        <div className="grid">{C.team.members.map((m, i) => (
          <Rv key={m.id} d={(i % 5) * 70}><button className="card" onClick={() => setP(m)}>
            <span className="ph"><img src={m.img} alt="" loading="lazy" /></span>
            <span className="nm">{m.name}</span><span className="rl" {...html(m.role)} />
          </button></Rv>))}</div>
        <p className="note">{C.team.note}</p>
      </div>
      <div className={`drawer tm ${p ? 'open' : ''}`} aria-hidden={!p}>
        <div className="veil" onClick={() => setP(null)} />
        <aside role="dialog" aria-label={p?.name} ref={panel}>
          {p && <><button className="x" onClick={() => setP(null)}>Close</button>
            <img src={p.img} alt={p.name} /><h3 className="h3">{p.name}</h3><p className="role" {...html(p.role)} />
            <dl>{p.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>}
        </aside>
      </div>
    </section>)
}

const Approach = () => (
  <section id="approach" className="sec dark approach-sec">
    <div className="approach-bg" aria-hidden="true"><BgVideo src={U('/video/approach.mp4')} poster={U('/video/approach-poster.jpg')} /></div>
    <div className="approach-scrim" aria-hidden="true" />
    <div className="wrap split">
      <div className="stick"><Label>Approach</Label><Rv as="h2" className="h2">How we invest.</Rv></div>
      <ul className="princ">{C.approach.map((a, i) => (
        <Rv as="li" key={i} d={i * 110}><h3>{a.h}</h3><p>{a.p}</p></Rv>))}</ul>
    </div>
  </section>)

const CO_ICON_BOLT = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 5 13.5h5L10.5 22 19 10.5h-5z"/></svg>
const CO_ICON_TREND = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 17l5.5-5.5 3.5 3.5L21 6"/><path d="M15 6h6v6"/></svg>
const CO_ICON_BUILD = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V9.5l5 3.2V9.5l5 3.2V5.5h4V21"/><path d="M9 17h1.5M13.5 17H15"/></svg>
const CO_BUILD_WORDS = ['manufactur', 'facilit', 'plant', 'capex', 'infrastructur', 'capacity', 'network', 'platform', 'hardware', 'device', 'energy', 'solar', 'mining', 'resource', 'logistic', 'building', 'units', 'recycling', 'steel', 'wire']
const CO_TREND_WORDS = ['scal', 'grow', 'expansion', 'expanding', 'demand', 'record', 'accelerat', 'adoption', 'uptime', 'return', 'revenue', 'margin', 'valuation']
const coIcon = t => {
  const s = (t || '').toLowerCase()
  if (CO_BUILD_WORDS.some(k => s.includes(k))) return CO_ICON_BUILD
  if (CO_TREND_WORDS.some(k => s.includes(k))) return CO_ICON_TREND
  return CO_ICON_BOLT
}

function coData(f) {
  const pts = f.pts3 || f.pts || [];
  return {
    logo: f.logo,
    name: f.name,
    tagline: f.tag || '',
    points: [pts[0] || '', pts[1] || '', pts[2] || ''],
    quote: f.q || '',
    person: f.who || '',
    designation: f.role || '',
    link: f.url || ''
  };
}

function CoModal({ d }) {
  return (
    <div className="co-grid">
      <div className="co-side">
        <img className="co-logo" src={d.logo} alt="" />
        <h3 className="co-name">{d.name}</h3>
        <span className="co-rule" aria-hidden="true" />
        <p className="co-tag">{d.tagline}</p>
        {d.link && <a className="co-cta" href={d.link} target="_blank" rel="noopener">
          <span className="co-cta-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg></span>
          <span className="co-cta-lb">Explore company</span>
        </a>}
      </div>
      <div className="co-main">
        <ul className="co-points">
          {d.points.map((p, k) => <li key={k}><span className="co-ic" aria-hidden="true">{coIcon(p)}</span><span className="co-pt">{p}</span></li>)}
        </ul>
        <span className="co-div" aria-hidden="true" />
        <div className="co-quote">
          <p>{d.quote || '\u00A0'}</p>
        </div>
        <div className="co-attrib">
          <b>{d.person}</b>
          <span>{d.designation}</span>
        </div>
      </div>
    </div>
  );
}

function Portfolio() {
  const [sel, setSel] = useState(-1)
  const panel = useRef()
  const f = sel >= 0 ? C.feat[sel] : null
  useTrap(sel >= 0, panel)
  useEffect(() => {
    if (!f) return
    const k = e => e.key === 'Escape' && setSel(-1)
    addEventListener('keydown', k)
    try { window.__lenis && window.__lenis.stop() } catch (e) {}
    const x = document.querySelector('.modal.co .x'); x && x.focus()
    return () => { removeEventListener('keydown', k); try { window.__lenis && window.__lenis.start() } catch (e) {} }
  }, [f])
  return (
    <section id="portfolio" className="sec">
      <div className="wrap">
        <SecLabel>A selection of our investments</SecLabel>
        <Rv as="h2" className="h2">Key Investments</Rv>
        <ul className="inv-grid">{C.grid.map((g, i) => { const d = C.feat[i]; return (
          <Rv as="li" key={g.name} d={i * 40} className="inv-item">
            <button className="inv-card" disabled={!d} aria-haspopup="dialog" onClick={() => setSel(i)}>
              <span className="inv-logo"><img src={g.logo} alt="" loading="lazy" /></span>
              <span className="inv-name">{g.name}</span>
              <span className="inv-d">{g.d}</span>
              {d && <svg className="inv-arrow" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          </Rv>) })}</ul>
      </div>
      <div className={`modal co ${sel >= 0 ? 'open' : ''}`} aria-hidden={sel < 0}>
        <div className="veil" onClick={() => setSel(-1)} />
        <div className="mcard" role="dialog" aria-label={f ? f.name : 'Company details'} ref={panel}>
          {f && <>
            <button className="x" onClick={() => setSel(-1)} aria-label="Close">&times;</button>
            <CoModal d={coData(f)} />
          </>}
        </div>
      </div>
    </section>)
}

function Investors() {
  const T = ['FAQs', 'Policies', 'Definitions'], [t, setT] = useState(0), [qs, setQs] = useState(() => new Set())
  const refs = useRef([]), [ind, setInd] = useState({ x: 0, w: 0 })
  useLayoutEffect(() => { const e = refs.current[t]; e && setInd({ x: e.offsetLeft, w: e.offsetWidth }) }, [t])
  const toggle = (i) => setQs(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  const onKey = (e) => { const n = T.length; let j = t
    if (e.key === 'ArrowRight') j = (t + 1) % n
    else if (e.key === 'ArrowLeft') j = (t - 1 + n) % n
    else if (e.key === 'Home') j = 0
    else if (e.key === 'End') j = n - 1
    else return
    e.preventDefault(); setT(j); refs.current[j]?.focus() }
  return (
    <section id="investors" className="sec tint">
      <div className="wrap narrow">
        <Label>Investors</Label>
        <Rv as="h2" className="h2">Investor information</Rv>
        <div className="tabs" role="tablist" aria-label="Investor information" onKeyDown={onKey}>{T.map((x, i) => <button key={x} id={`tab-${i}`} role="tab" aria-selected={t === i} aria-controls={`panel-${i}`} tabIndex={t === i ? 0 : -1} ref={el => refs.current[i] = el} onClick={() => setT(i)}>{x}</button>)}<span className="ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} /></div>
        <div className="panel" id={`panel-${t}`} role="tabpanel" aria-labelledby={`tab-${t}`} tabIndex={0} key={t}>
          {t === 0 && <div className="faq-list">{C.faq.map((f, i) => { const on = qs.has(i); return (
            <div key={i} className={`faq ${on ? 'on' : ''}`}><button id={`faq-q-${i}`} aria-expanded={on} aria-controls={`faq-a-${i}`} onClick={() => toggle(i)}><span>{f.q}</span><i aria-hidden="true" /></button><div className="ans" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}><div><p {...html(f.a)} /></div></div></div>) })}</div>}
          {t === 1 && <><p className="note first">Policies of Anchorage Capital and its schemes, available to download below.</p>{C.pol.map(p => <div key={p.t} className="pol"><div><h3>{p.t}</h3><p>{p.d}</p></div><div className="pol-act"><a className="dl" href={p.href} download aria-label={`Download ${p.t}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/></svg>Download PDF</a><small>{p.meta}</small></div></div>)}</>}
          {t === 2 && <><p className="note first">{C.defs.note}</p><dl className="defs">{C.defs.items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>}
        </div>
      </div>
    </section>)
}

const Contact = () => {
  const [doc, setDoc] = useState(null)
  const panel = useRef()
  useTrap(!!doc, panel)
  useEffect(() => {
    if (!doc) return
    const k = e => e.key === 'Escape' && setDoc(null)
    addEventListener('keydown', k)
    try { window.__lenis && window.__lenis.stop() } catch (e) {}
    return () => { removeEventListener('keydown', k); try { window.__lenis && window.__lenis.start() } catch (e) {} }
  }, [doc])
  return (
  <section id="contact" className="sec dark">
    <div className="wrap">
        <div className="ct-lead">
          <div className="ct-intro">
            <Label>Contact</Label>
            <Rv as="h2" className="h1">Get in touch.</Rv>
            <Rv as="p" d={120} className="lede">For investor enquiries, write to the team directly.</Rv>
          </div>
          <Rv d={180} className="ct-direct">
            <h3 className="ct-kicker">Direct</h3>
            <a className="ct-mail" href="mailto:investor@anchoragealpha.com">
              <span>investor@anchoragealpha.com</span>
              <svg className="ct-arrow" width="18" height="18" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </Rv>
        </div>
        <div className="ct-facts">
          <Rv d={0} className="ct-fact">
            <h3><span className="ct-idx" aria-hidden="true">01</span>Office</h3>
            <address>209/210, 2nd Floor, Arcadia Building<br />NCPA Marg, Nariman Point<br />Mumbai, Maharashtra 400021</address>
            <p><a href="tel:+912240198600">022-40198600</a></p>
          </Rv>
          <Rv d={90} className="ct-fact">
            <h3><span className="ct-idx" aria-hidden="true">02</span>Enquiries</h3>
            <p><b>Investors</b><a href="mailto:investor@anchoragealpha.com">investor@anchoragealpha.com</a></p>
            <p><b>General</b><a href="mailto:contact@anchoragealpha.com">contact@anchoragealpha.com</a></p>
          </Rv>
          <Rv d={180} className="ct-fact" id="grievance">
            <h3><span className="ct-idx" aria-hidden="true">03</span>Grievance redressal</h3>
            <p><b>SEBI SCORES</b><a href="https://scores.sebi.gov.in/" target="_blank" rel="noopener">scores.sebi.gov.in</a></p>
            <p><b>Dispute portal</b><a href="https://smartodr.in/" target="_blank" rel="noopener">smartodr.in</a></p>
          </Rv>
        </div>
        <Rv d={0} className="ct-reg">
          <h3 className="ct-kicker">Fund &amp; regulatory</h3>
          <dl>
            <div><dt>Fund</dt><dd>Anchorage Capital</dd></div>
            <div><dt>Category</dt><dd>Category II AIF</dd></div>
            <div><dt>SEBI registration</dt><dd>IN/AIF2/21-22/1003</dd></div>
            <div><dt>Sponsor</dt><dd>Rohit Kothari</dd></div>
            <div><dt>Investment manager</dt><dd>Anchorage Alpha Investments Advisor Private Limited</dd></div>
            <div><dt>Trustee</dt><dd>Orbis Trusteeship Services Private Limited</dd></div>
            <div><dt>Compliance officer</dt><dd>Bhaven Jain</dd></div>
          </dl>
        </Rv>
      <footer onClick={e => { if (e.target.closest('.nw')) { e.preventDefault(); setDoc('legal'); } }}>
        <div className="foot-top">
          <p className="foot-copy">{C.footer[2]}</p>
          <nav className="foot-links" aria-label="Legal and privacy">
            <button type="button" className="foot-link" onClick={() => setDoc('legal')}>Legal information</button>
            <button type="button" className="foot-link" onClick={() => setDoc('privacy')}>Privacy</button>
          </nav>
        </div>
        <div className="foot-main">{C.footer.slice(0, 2).map((p, i) => <p key={i} {...html(p)} />)}</div>
      </footer>
    </div>
    <div className={`drawer doc ${doc ? 'open' : ''}`} aria-hidden={!doc}>
      <div className="veil" onClick={() => setDoc(null)} />
      <aside role="dialog" aria-label={doc === 'privacy' ? 'Privacy' : 'Legal information'} ref={panel}>
        {doc && <><button className="x" onClick={() => setDoc(null)}>Close</button>
          <h3 className="h3">{doc === 'privacy' ? 'Privacy' : 'Legal information'}</h3>
          {(doc === 'privacy' ? C.privacy : C.legal).map((p, i) => <p key={i} className="doc-p" {...html(p)} />)}</>}
      </aside>
    </div>
  </section>)
}

const ToTop = () => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; setShow(window.scrollY > window.innerHeight * 0.9) }) }
    addEventListener('scroll', on, { passive: true }); on()
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  return (
    <button
      type="button"
      className={`to-top ${show ? 'show' : ''}`}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onClick={() => goTo('top')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5.5 11.5 12 5l6.5 6.5"/></svg>
    </button>)
}

export default function App() {
  const [active, setActive] = useState('top'), [solid, setSolid] = useState(false)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    lenis = new Lenis({ lerp: (window.paused || reduce) ? 1 : 0.085, wheelMultiplier: 0.9 })
    window.__lenis = lenis
    lenis.scrollTo(0, { immediate: true })
    let raf; const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }; raf = requestAnimationFrame(loop)
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; return }
      if (!raf) raf = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVis)
    const root = document.documentElement
    const on = () => {
      const y = scrollY, h = innerHeight, max = root.scrollHeight - h
      root.style.setProperty('--p', Math.min(1, y / h)); root.style.setProperty('--prog', max > 0 ? y / max : 0)
      setSolid(y > h * 0.82)
    }
    lenis.on('scroll', on); on()
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    NAV.forEach(([id]) => io.observe(document.getElementById(id)))
    return () => { if (raf) cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); lenis.destroy(); io.disconnect() }
  }, [])
  return <><a className="a11y-skip" href="#a11y-main">Skip to main content</a><Nav active={active} solid={solid} /><main id="a11y-main" tabIndex={-1}><Hero /><About /><Legacy /><Team /><Approach /><Portfolio /><Investors /><Contact /></main><ToTop /></>
}
