import { useEffect, useRef, useState } from 'react'
import { Star, Sparkle } from './Doodles.jsx'

const INK = '#4a2c25'
const EDGE = 16 // keep the note this far from the viewport edges
const CODE = [2, 0, 1, 0] // 20/10

// The hint note plays hard to get: it hops somewhere else on screen once per
// taunt, and only lets itself be read after that.
const NOTE_TAUNTS = [
  'Catch me if you can~ 😜',
  'Hụt rồi nha! Nhanh tay lên nàooo 🏃‍♀️💨',
  'Hơi bị lì đó nha... nhưng vẫn chưa đủ đâu! 😝',
]

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
  const [dodges, setDodges] = useState(0)
  const [taunt, setTaunt] = useState(null)
  const [notePos, setNotePos] = useState(null) // null = taped to the envelope corner
  const timers = useRef([])
  const stageRef = useRef(null)
  const noteRef = useRef(null)
  const panelRef = useRef(null)

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
    if (taunt === null) return
    const t = setTimeout(() => setTaunt(null), 1800)
    return () => clearTimeout(t)
  }, [taunt])

  // a resize would leave the note stranded off-screen, so send it home
  useEffect(() => {
    const onResize = () => setNotePos(null)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Pick a random visible spot that's well away from where the note is now and
  // doesn't cover the combination wheels.
  const findHideout = () => {
    const stage = stageRef.current.getBoundingClientRect()
    const note = noteRef.current.getBoundingClientRect()
    const panel = panelRef.current.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const maxX = Math.max(EDGE, vw - note.width - EDGE)
    const maxY = Math.max(EDGE, vh - note.height - EDGE)
    const minJump = Math.min(vw, vh) * 0.35
    const overlapsPanel = (x, y) =>
      x < panel.right + 8 && x + note.width > panel.left - 8 && y < panel.bottom + 8 && y + note.height > panel.top - 8

    let spot = null
    for (let i = 0; i < 40 && !spot; i++) {
      const x = EDGE + Math.random() * (maxX - EDGE)
      const y = EDGE + Math.random() * (maxY - EDGE)
      const far = Math.hypot(x - note.left, y - note.top) > minJump
      // on tiny screens there may be no spot that is both far and clear, so relax the distance at the end
      if (!overlapsPanel(x, y) && (far || i > 30)) spot = { x, y }
    }
    spot ??= { x: EDGE + Math.random() * (maxX - EDGE), y: EDGE }
    return {
      left: spot.x - stage.left,
      top: spot.y - stage.top,
      right: spot.x + note.width / 2 > vw / 2,
      below: spot.y < 90,
    }
  }

  const pokeNote = () => {
    if (dodges < NOTE_TAUNTS.length) {
      setNotePos(findHideout())
      setDodges(dodges + 1)
      setTaunt(dodges)
      return
    }
    setTaunt(null)
    setHint(true)
  }

  useEffect(() => {
    if (!hint) return
    const onKey = (e) => e.key === 'Escape' && setHint(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hint])

  return (
    <div className={`envelope-screen ${unlocked ? 'unlocked' : ''} ${opening ? 'opening' : ''}`}>
      <div className="env-stage" ref={stageRef}>
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

        <button
          ref={noteRef}
          className="hint-note"
          style={notePos ? { top: notePos.top, left: notePos.left } : undefined}
          onClick={pokeNote}
          aria-haspopup="dialog"
          aria-expanded={hint}
        >
          {taunt !== null && (
            <span
              key={taunt}
              className={`note-taunt ${notePos?.right ? 'right' : ''} ${notePos?.below ? 'below' : ''}`}
              role="status"
            >
              {NOTE_TAUNTS[taunt]}
            </span>
          )}
          <span className="hint-tape" aria-hidden="true" />
          <span className="hint-title">Gợi ý?</span>
          <span className="hint-sub">chạm để xem</span>
        </button>
      </div>

      <div className="lock-panel" ref={panelRef}>
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
            <p className="hint-card-title">Huhu bị bắt rồi 🙈 Gợi ý nè...</p>
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
