import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import C from './content.json'

const NAV = [['top','Home'],['about','About us'],['legacy','Legacy'],['team','Team'],['approach','Approach'],['portfolio','Investments'],['investors','Investors'],['contact','Contact']]
const html = (h) => ({ dangerouslySetInnerHTML: { __html: h } })
let lenis
const goTo = (id) => lenis ? lenis.scrollTo(id === 'top' ? 0 : '#' + id, { duration: window.paused ? 0 : 1.6, easing: t => 1 - Math.pow(1 - t, 4) }) : document.getElementById(id)?.scrollIntoView({ behavior: window.paused ? 'auto' : 'smooth' })

/* in-view toggle used by every reveal */
function useSeen(margin = '0px 0px -12% 0px') {
  const ref = useRef(), [seen, set] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (set(true), io.disconnect()), { rootMargin: margin })
    io.observe(ref.current); return () => io.disconnect()
  }, [margin])
  return [ref, seen]
}
const Rv = ({ as: T = 'div', d = 0, className = '', children, ...p }) => {
  const [ref, seen] = useSeen()
  return <T ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ '--d': d + 'ms' }} {...p}>{children}</T>
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
  return <b ref={ref} aria-live="polite">{m[1]}{n}<span {...html(m[3])} /></b>
}

/* Hero video: two stacked players, the next one fades in over the last 1.4s of the current one */
function LoopVideo() {
  const A = useRef(), B = useRef()
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let cur = A.current, nxt = B.current, busy = false, raf
    const F = 1.4
    cur.play().catch(() => {})
    const tick = () => {
      if (window.paused) { if (cur.ended) { try { cur.currentTime = 0; cur.play().catch(() => {}) } catch (e) {} } raf = requestAnimationFrame(tick); return }
      if (cur.duration && !busy && cur.currentTime >= cur.duration - F) {
        busy = true; const old = cur; nxt.currentTime = 0; nxt.play().catch(() => {})
        nxt.style.zIndex = 2; old.style.zIndex = 1; nxt.classList.add('on')
        setTimeout(() => { old.pause(); old.classList.remove('on'); old.currentTime = 0; cur = nxt; nxt = old; busy = false }, F * 1000 + 80)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [])
  const p = { muted: true, playsInline: true, preload: 'auto', poster: '/video/poster.jpg', 'aria-hidden': true }
  return <div className="vid"><video ref={A} className="on" {...p}><source src="/video/hero.mp4" type="video/mp4" /></video><video ref={B} {...p}><source src="/video/hero.mp4" type="video/mp4" /></video></div>
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
      <img className="hero-logo a11y-keep" src="/img/logo-white.png" alt="Anchorage Alpha" />
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
        {a.schemes.map((s, i) => { const aum = /AUM/.test(s.l), [usd, inr] = s.n.replace('*', '').split('₹'); const date = s.d.replace(/^Inception\s*/, ''); return (
          <Rv key={i} d={i * 90} className={`scheme ${aum ? 'aum' : ''}`}>
            <span className="k">{s.l}</span>
            {aum
              ? <><span className="big">{usd.trim()}<sup>*</sup><i className="vsep" aria-hidden="true" /><span className="inr">₹{inr}</span></span></>
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
        <aside role="dialog" aria-label={p?.name}>
          {p && <><button className="x" onClick={() => setP(null)}>Close</button>
            <img src={p.img} alt={p.name} /><h3 className="h3">{p.name}</h3><p className="role" {...html(p.role)} />
            <dl>{p.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>}
        </aside>
      </div>
    </section>)
}

const Approach = () => (
  <section id="approach" className="sec dark approach-sec">
    <div className="approach-bg"><video src="/video/approach.mp4" poster="/video/approach-poster.jpg" muted loop playsInline autoPlay preload="metadata" aria-hidden="true" /></div>
    <div className="approach-scrim" aria-hidden="true" />
    <div className="wrap split">
      <div className="stick"><Label>Approach</Label><Rv as="h2" className="h2">How we invest.</Rv></div>
      <ul className="princ">{C.approach.map((a, i) => (
        <Rv as="li" key={i} d={i % 2 ? 80 : 0}><h3>{a.h}</h3><p>{a.p}</p></Rv>))}</ul>
    </div>
  </section>)

function Portfolio() {
  const [sel, setSel] = useState(-1)
  const f = sel >= 0 ? C.feat[sel] : null
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
        <div className="mcard" role="dialog" aria-label={f ? f.name : 'Company details'}>
          {f && <><button className="x" onClick={() => setSel(-1)} aria-label="Close">&times;</button>
            <img className="co-logo" src={f.logo} alt={f.name} />
            <h3 className="h3">{f.name}</h3>
            <p className="tag">{f.tag}</p>
            {f.url && <a className="ul" href={f.url} target="_blank" rel="noopener">Explore company</a>}
            <ul className="co-pts">{f.pts.map((p, k) => <li key={k}>{p}</li>)}</ul>
            <blockquote><p>{f.q}</p><footer><b>{f.who}</b> {f.role}</footer></blockquote>
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
          {t === 1 && <><p className="note first">Policies of Anchorage Capital and its schemes, available to download as PDF.</p>{C.pol.map(p => <div key={p.t} className="pol"><div><h3>{p.t}</h3><p>{p.d}</p></div><a href={p.href} download className="ul">Download<small>{p.meta}</small></a></div>)}</>}
          {t === 2 && <><p className="note first">{C.defs.note}</p><dl className="defs">{C.defs.items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>}
        </div>
      </div>
    </section>)
}

const Contact = () => {
  const [doc, setDoc] = useState(null)
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
      <Label>Contact</Label>
      <Rv as="h2" className="h1">Speak with us.</Rv>
      <Rv as="p" d={120} className="lede">For investor enquiries, write to the team directly.</Rv>
      <a className="mail" href="mailto:investor@anchoragealpha.com">investor@anchoragealpha.com</a>
      <div className="cols">
        <div><h3>Office</h3><address>209/210, 2nd Floor, Arcadia Building<br />NCPA Marg, Nariman Point<br />Mumbai, Maharashtra 400021<br /><a href="tel:+912240198600">022-40198600</a></address></div>
        <div><h3>Enquiries</h3><p><b>Investors:</b> <a href="mailto:investor@anchoragealpha.com">investor@anchoragealpha.com</a></p><p><b>General:</b> <a href="mailto:contact@anchoragealpha.com">contact@anchoragealpha.com</a></p></div>
        <div><h3>Fund &amp; regulatory</h3><p><b>Fund:</b> Anchorage Capital</p><p><b>Category:</b> Category II AIF</p><p><b>SEBI registration:</b> IN/AIF2/21-22/1003</p><p><b>Sponsor:</b> Rohit Kothari</p><p><b>Investment manager:</b> Anchorage Alpha Investments Advisor Private Limited</p><p><b>Trustee:</b> Orbis Trusteeship Services Private Limited</p><p><b>Compliance officer:</b> Bhaven Jain</p></div>
        <div id="grievance"><h3>Investor grievance redressal</h3><p>SEBI SCORES<br /><a href="https://scores.sebi.gov.in/" target="_blank" rel="noopener">https://scores.sebi.gov.in/</a></p><p>Online Dispute Resolution Portal<br /><a href="https://smartodr.in/" target="_blank" rel="noopener">https://smartodr.in/</a></p></div>
      </div>
      <footer onClick={e => { if (e.target.closest('.nw')) { e.preventDefault(); setDoc('legal'); } }}>
        {C.footer.map((p, i) => <p key={i} {...html(p)} />)}
        <div className="foot-docs" id="legal">
          <button type="button" className="foot-doc-btn" aria-haspopup="dialog" onClick={() => setDoc('legal')}>Legal information</button>
          <button type="button" className="foot-doc-btn" aria-haspopup="dialog" onClick={() => setDoc('privacy')}>Privacy</button>
        </div>
      </footer>
    </div>
    <div className={`drawer doc ${doc ? 'open' : ''}`} aria-hidden={!doc}>
      <div className="veil" onClick={() => setDoc(null)} />
      <aside role="dialog" aria-label={doc === 'privacy' ? 'Privacy' : 'Legal information'}>
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
    const on = () => setShow(window.scrollY > window.innerHeight * 0.9)
    addEventListener('scroll', on, { passive: true }); on()
    return () => removeEventListener('scroll', on)
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
    const root = document.documentElement
    const on = () => {
      const y = scrollY, h = innerHeight, max = root.scrollHeight - h
      root.style.setProperty('--p', Math.min(1, y / h)); root.style.setProperty('--prog', max > 0 ? y / max : 0)
      setSolid(y > h * 0.82)
    }
    lenis.on('scroll', on); on()
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    NAV.forEach(([id]) => io.observe(document.getElementById(id)))
    return () => { cancelAnimationFrame(raf); lenis.destroy(); io.disconnect() }
  }, [])
  return <><a className="a11y-skip" href="#a11y-main">Skip to main content</a><Nav active={active} solid={solid} /><main id="a11y-main" tabIndex={-1}><Hero /><About /><Legacy /><Team /><Approach /><Portfolio /><Investors /><Contact /></main><ToTop /></>
}
