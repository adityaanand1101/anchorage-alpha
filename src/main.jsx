import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './v2.css'
import './v3.css'

class Boundary extends React.Component {
  state = { hit: false }
  static getDerivedStateFromError() { return { hit: true } }
  componentDidCatch(e) { console.error(e) }
  render() {
    if (this.state.hit) return (
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', padding: '10vh 8vw', background: '#FAF7F2', color: '#1B1B1B', font: '400 17px/1.7 Inter, system-ui, sans-serif' }}>
        <h1 style={{ margin: 0, font: '400 clamp(1.9rem,5vw,2.8rem)/1.1 "Playfair Display", Georgia, serif', letterSpacing: '-.012em' }}>This page could not load.</h1>
        <p style={{ margin: 0, maxWidth: '54ch', color: '#6B6B6B' }}>Please reload. If it keeps happening, write to <a href="mailto:contact@anchoragealpha.com" style={{ color: '#8B6B3E' }}>contact@anchoragealpha.com</a>.</p>
      </main>
    )
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<Boundary><App /></Boundary>)