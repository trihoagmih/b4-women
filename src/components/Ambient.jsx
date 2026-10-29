import { useEffect, useMemo, useRef, useState } from 'react'
import { Star, Sparkle, Heart } from './Doodles.jsx'

const rand = (min, max) => Math.random() * (max - min) + min

// Petals, stars and hearts drifting down behind everything.
export function FallingDoodles({ count = 12 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        kind: ['petal', 'petal', 'star', 'heart'][i % 4],
        left: rand(0, 100),
        size: rand(14, 30),
        duration: rand(12, 24),
        delay: -rand(0, 24),
        sway: rand(20, 60),
      })),
    [count]
  )

  return (
    <div className="falling" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.id}
          className="fall"
          style={{
            left: `${it.left}%`,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            '--sway': `${it.sway}px`,
          }}
        >
          {it.kind === 'petal' && <span className="petal" style={{ width: it.size, height: it.size * 0.7 }} />}
          {it.kind === 'star' && <Star fx="none" size={it.size} />}
          {it.kind === 'heart' && <Heart fx="none" size={it.size} />}
        </span>
      ))}
    </div>
  )
}

// Every tap on the page throws a little burst of stars, hearts and sparkle dashes.
export function ClickBursts() {
  const [bursts, setBursts] = useState([])

  useEffect(() => {
    const onDown = (e) => {
      const id = Date.now() + Math.random()
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1000)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  return (
    <div className="bursts" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="burst" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 7 }, (_, i) => {
            const Comp = [Star, Heart, Sparkle][i % 3]
            return (
              <span
                key={i}
                className="burst-bit"
                style={{ '--a': `${(360 / 7) * i + rand(-12, 12)}deg`, '--d': `${rand(40, 80)}px` }}
              >
                <Comp fx="none" size={18} />
              </span>
            )
          })}
        </span>
      ))}
    </div>
  )
}

// A little trail of sparkles behind the mouse. Plain DOM nodes (no React state)
// so moving the mouse never triggers a re-render.
const TRAIL = [
  ['✦', '#f2b01e'],
  ['♥', '#f29b9b'],
  ['✧', '#7ea3d6'],
]

export function CursorTrail() {
  const layer = useRef(null)

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last = 0
    let n = 0
    const onMove = (e) => {
      const now = performance.now()
      if (now - last < 45) return
      last = now
      const [glyph, color] = TRAIL[n++ % TRAIL.length]
      const el = document.createElement('span')
      el.className = 'trail'
      el.textContent = glyph
      el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${color}`
      el.addEventListener('animationend', () => el.remove())
      layer.current.appendChild(el)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return <div ref={layer} className="trail-layer" aria-hidden="true" />
}
