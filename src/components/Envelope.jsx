import { useEffect, useRef, useState } from 'react'
import { Star, Sparkle } from './Doodles.jsx'

const INK = '#2b2321'
const CODE = [2, 0, 1, 0] // 20/10

// Brass padlock with a heart keyhole; the shackle springs up when unlocked.
function Padlock() {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.55" stopColor="#efbe4e" />
          <stop offset="1" stopColor="#c98f22" />
        </linearGradient>
      </defs>
      <g className="shackle">
        <path d="M22 50 V30 a18 18 0 0 1 36 0 V50" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M22 50 V30 a18 18 0 0 1 36 0 V50" fill="none" stroke="#dfe3ea" strokeWidth="5" strokeLinecap="round" />
      </g>
      <rect x="8" y="44" width="64" height="52" rx="13" fill="url(#brass)" stroke={INK} strokeWidth="3" />
      <rect x="15" y="50" width="8" height="26" rx="4" fill="#fff" opacity="0.45" />
      <path
        d="M40 82 C30 75 27 69 31 64 C34 60 38 62 40 65 C42 62 46 60 49 64 C53 69 50 75 40 82 Z"
        fill="#7a4a12" stroke={INK} strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  )
}

const Chevron = ({ up }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d={up ? 'M6 15 L12 9 L18 15' : 'M6 9 L12 15 L18 9'} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Wheel({ index, value, onSpin, solved }) {
  const onKey = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); onSpin(index, 1) }
    if (e.key === 'ArrowDown') { e.preventDefault(); onSpin(index, -1) }
  }
  return (
    <div className="wheel">
      <button className="wheel-btn" onClick={() => onSpin(index, 1)} aria-label={`Tăng số thứ ${index + 1}`} disabled={solved}>
        <Chevron up />
      </button>
      <button className="wheel-digit" onClick={() => onSpin(index, 1)} onKeyDown={onKey} aria-label={`Số thứ ${index + 1}: ${value}`} disabled={solved}>
        <span key={value} className="wheel-num">{value}</span>
      </button>
      <button className="wheel-btn" onClick={() => onSpin(index, -1)} aria-label={`Giảm số thứ ${index + 1}`} disabled={solved}>
        <Chevron />
      </button>
    </div>
  )
}

export default function Envelope({ onOpen }) {
  const [digits, setDigits] = useState([0, 0, 0, 0])
  const [unlocked, setUnlocked] = useState(false)
  const [opening, setOpening] = useState(false)
  const [hint, setHint] = useState(false)
  const [shake, setShake] = useState(0)
  const timers = useRef([])

  const spin = (i, delta) =>
    setDigits((d) => d.map((v, j) => (j === i ? (v + delta + 10) % 10 : v)))

  useEffect(() => {
    if (unlocked || digits.some((v, i) => v !== CODE[i])) return
    setUnlocked(true)
    setHint(false)
    timers.current.push(setTimeout(() => setOpening(true), 900))
    timers.current.push(setTimeout(onOpen, 900 + 2100))
  }, [digits, unlocked, onOpen])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (!hint) return
    const onKey = (e) => e.key === 'Escape' && setHint(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hint])

  return (
    <div className={`envelope-screen ${unlocked ? 'unlocked' : ''} ${opening ? 'opening' : ''}`}>
      <div className="env-stage">
        <Star size={46} className="env-spark env-spark-r" />
        <Sparkle size={52} className="env-spark env-spark-l" />
        <span className="env-shadow" aria-hidden="true" />

        <div className="envelope">
          <svg className="env-back" viewBox="0 0 340 230" aria-hidden="true">
            <defs>
              <pattern id="lining" width="18" height="18" patternUnits="userSpaceOnUse">
                <rect width="18" height="18" fill="#f8d3da" />
                <circle cx="5" cy="5" r="2.2" fill="#fff4f6" />
                <circle cx="14" cy="14" r="2.2" fill="#fff4f6" />
              </pattern>
            </defs>
            <rect x="4" y="4" width="332" height="222" rx="14" fill="url(#lining)" stroke={INK} strokeWidth="3" />
          </svg>

          <div className="env-letter">
            <p>Gửi những bông hoa<br />xinh đẹp nhất</p>
            <Star size={26} />
          </div>

          <svg className="env-front" viewBox="0 0 340 230" aria-hidden="true">
            <defs>
              <linearGradient id="paper" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0" stopColor="#fff6ec" />
                <stop offset="1" stopColor="#fbe1d6" />
              </linearGradient>
            </defs>
            <g strokeLinejoin="round" strokeLinecap="round">
              <path
                d="M4 62 Q96 128 170 146 Q244 128 336 62 L336 212 Q336 226 322 226 L18 226 Q4 226 4 212 Z"
                fill="url(#paper)" stroke={INK} strokeWidth="3"
              />
              <path d="M10 220 Q110 160 158 146 M330 220 Q230 160 182 146" fill="none" stroke={INK} strokeOpacity="0.3" strokeWidth="2" />
            </g>
            {/* little daisy sprig tucked in the corner */}
            <g transform="translate(300 192)" stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
              <path d="M0 0 Q6 14 2 26" fill="none" />
              <ellipse cx="9" cy="16" rx="4" ry="8" transform="rotate(35 9 16)" fill="#9cc59a" />
              {Array.from({ length: 7 }, (_, i) => (
                <ellipse key={i} cx="0" cy="-8" rx="3.6" ry="7.5" transform={`rotate(${i * (360 / 7)})`} fill="#fff" />
              ))}
              <circle r="4.2" fill="#f2b01e" />
            </g>
          </svg>

          <svg className="env-flap" viewBox="0 0 340 150" aria-hidden="true">
            <defs>
              <linearGradient id="flap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fbe6d8" />
                <stop offset="1" stopColor="#f4cdbd" />
              </linearGradient>
            </defs>
            <path
              d="M4 16 Q4 4 16 4 L324 4 Q336 4 336 16 L192 128 Q170 144 148 128 Z"
              fill="url(#flap)" stroke={INK} strokeWidth="3" strokeLinejoin="round"
            />
          </svg>

          <button
            key={shake}
            className={`env-lock ${shake ? 'shake' : ''}`}
            onClick={() => !unlocked && setShake((n) => n + 1)}
            aria-label={unlocked ? 'Đã mở khóa' : 'Thư đang khóa — nhập mật mã bên dưới'}
          >
            <Padlock />
          </button>
        </div>

        <button className="hint-note" onClick={() => setHint(true)} aria-haspopup="dialog" aria-expanded={hint}>
          <span className="hint-tape" aria-hidden="true" />
          <span className="hint-title">Gợi ý?</span>
          <span className="hint-sub">chạm để xem</span>
        </button>
      </div>

      <div className="lock-panel">
        <p className="lock-title">{unlocked ? 'Mở khóa rồi!' : 'Hãy mở tôi'}</p>
        <p className="lock-sub">{unlocked ? 'Thư đang mở đây...' : 'Xoay đúng 4 con số để mở khóa'}</p>
        <div className="wheels" role="group" aria-label="Khóa số">
          {digits.map((v, i) => (
            <Wheel key={i} index={i} value={v} onSpin={spin} solved={unlocked} />
          ))}
        </div>
      </div>

      {hint && (
        <div className="hint-backdrop" onClick={() => setHint(false)}>
          <div className="hint-card" role="dialog" aria-modal="true" aria-label="Gợi ý mật mã" onClick={(e) => e.stopPropagation()}>
            <span className="hint-tape" aria-hidden="true" />
            <p className="hint-card-title">Psst... gợi ý nè</p>
            <p>
              Mùa thu, phố phường ngập sắc hoa, và các cô gái được cưng chiều nhất năm.
            </p>
            <p>
              Đó là <strong>ngày nào, tháng mấy</strong>? Ghép lại thành <strong>4 con số</strong> là mở được khóa nhé!
            </p>
            <button className="hint-ok" onClick={() => setHint(false)}>Đã hiểu!</button>
          </div>
        </div>
      )}
    </div>
  )
}
