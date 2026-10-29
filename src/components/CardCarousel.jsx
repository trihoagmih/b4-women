import { useEffect, useRef, useState } from 'react'
import LadyCard from './LadyCard.jsx'

// The ladies' cards: a wrapping grid on wide screens, and on phones (see the
// small-screen CSS) a swipeable carousel that snaps one card to the centre,
// with dots underneath showing where you are.
export default function CardCarousel({ ladies, onOpen }) {
  const trackRef = useRef(null)
  const [current, setCurrent] = useState(0)

  // the current card is whichever one sits nearest the middle of the track
  useEffect(() => {
    const track = trackRef.current
    let frame = 0
    const update = () => {
      frame = 0
      const mid = track.scrollLeft + track.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      Array.from(track.children).forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setCurrent(best)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    track.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const goTo = (i) => {
    const card = trackRef.current.children[i]
    trackRef.current.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - trackRef.current.clientWidth / 2, behavior: 'smooth' })
  }

  return (
    <>
      <div className="cards" ref={trackRef}>
        {ladies.map((l, i) => (
          <LadyCard key={l.id} lady={l} index={i} onOpen={onOpen} current={i === current} />
        ))}
      </div>
      <div className="card-dots" role="tablist" aria-label="Chọn thẻ">
        {ladies.map((l, i) => (
          <button
            key={l.id}
            className={`card-dot${i === current ? ' on' : ''}`}
            style={{ '--accent': l.color }}
            role="tab"
            aria-selected={i === current}
            aria-label={l.nickname}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </>
  )
}
