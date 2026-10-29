import { useEffect, useState } from 'react'
import { Star, Heart, Sparkle } from './Doodles.jsx'

function useTypewriter(text, speed = 38) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const t = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return shown
}

export default function LetterModal({ lady, onClose }) {
  const typed = useTypewriter(lady.vi)
  const done = typed.length === lady.vi.length

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    // lock the page behind the letter. It has to go on <html>: html sets its own
    // overflow-x, so body's overflow never reaches the viewport. Pad by the
    // scrollbar's width so the page doesn't jump sideways when it disappears.
    const root = document.documentElement
    const scrollbar = window.innerWidth - root.clientWidth
    root.style.overflow = 'hidden'
    root.style.paddingRight = `${scrollbar}px`
    return () => {
      window.removeEventListener('keydown', onKey)
      root.style.overflow = ''
      root.style.paddingRight = ''
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="letter-pop" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => {
          const Comp = [Star, Heart, Sparkle][i % 3]
          return (
            <span key={i} className="pop-bit" style={{ '--a': `${i * 36}deg`, '--delay': `${i * 0.03}s` }}>
              <Comp fx="none" size={26} />
            </span>
          )
        })}
      </div>

      <div
        className="letter"
        style={{ '--accent': lady.color }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Lời chúc cho ${lady.nickname}`}
      >
        <button className="letter-close" onClick={onClose} aria-label="Đóng">✕</button>

        <div className="letter-photo">
          <img src={lady.img} alt={lady.nickname} />
        </div>

        <div className="letter-body">
          <p className="letter-to">Gửi {lady.nickname},</p>
          <p className="letter-text">
            {typed}
            {!done && <span className="caret">|</span>}
          </p>
          <p className={`letter-en ${done ? 'show' : ''}`}>{lady.en}</p>
          <p className={`letter-sign ${done ? 'show' : ''}`}>
            Chúc mừng 20/10 <Heart size={22} />
          </p>
        </div>
      </div>
    </div>
  )
}
