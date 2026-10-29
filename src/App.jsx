import { useEffect, useState } from 'react'
import { SvgFilters, Sparkle, Heart, Blob, Shuttlecock } from './components/Doodles.jsx'
import { FallingDoodles, ClickBursts, CursorTrail } from './components/Ambient.jsx'
import Envelope from './components/Envelope.jsx'
import Hero from './components/Hero.jsx'
import CardCarousel from './components/CardCarousel.jsx'
import LetterModal from './components/LetterModal.jsx'
import Bouquet from './components/Bouquet.jsx'
import WishRibbon from './components/WishRibbon.jsx'
import { ladies } from './ladies.js'

// Adds .in to .reveal elements (and .drawn to the bouquet) once they scroll into view.
function useReveal(active) {
  useEffect(() => {
    if (!active) return
    let frame = 0
    const check = () => {
      frame = 0
      const pending = document.querySelectorAll('.reveal:not(.in), .bouquet-section:not(.drawn)')
      pending.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < innerHeight * 0.85 && r.bottom > 0) {
          el.classList.add(el.classList.contains('reveal') ? 'in' : 'drawn')
        }
      })
      if (!pending.length) stop()
    }
    // at most one check per frame, however many scroll events fire
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
    const stop = () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return stop
  }, [active])
}

export default function App() {
  // ?open in the URL skips the envelope intro
  const [opened, setOpened] = useState(() => new URLSearchParams(location.search).has('open'))
  const [active, setActive] = useState(null)
  useReveal(opened)

  return (
    <>
      <SvgFilters />
      <div className="paper-wash" aria-hidden="true" />
      <FallingDoodles />
      <ClickBursts />
      <CursorTrail />

      {!opened && <Envelope onOpen={() => setOpened(true)} />}

      {opened && (
        <main className="main">
          <Hero />
          <WishRibbon />

          <section id="gallery" className="gallery">
            <h2 className="section-title reveal">
              <Blob color="#f6b9c4" />
              <span>Những cô gái tuyệt vời</span>
            </h2>
            <p className="section-sub reveal">
              Nhận ra mình trong tranh chưa nè? Chạm vào để mở lời chúc dành riêng cho bạn nhé <Sparkle size={26} />
            </p>
            <CardCarousel ladies={ladies} onOpen={setActive} />
          </section>

          <Bouquet />

          <footer className="footer">
            <p className="footer-love">
              Made with <Heart size={18} /> love
            </p>
            <p className="footer-from">
              <Shuttlecock size={34} />
              <span>From B4 Badminton Club</span>
            </p>
          </footer>
        </main>
      )}

      {active && <LetterModal lady={active} onClose={() => setActive(null)} />}
    </>
  )
}
