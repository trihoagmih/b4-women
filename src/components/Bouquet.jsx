import { useRef, useState } from 'react'
import { Heart, Sparkle } from './Doodles.jsx'

const INK = '#4a2c25'

function Daisy({ x, y, color, center = '#f2b01e', delay, r = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r})`}>
      <g className="sway" style={{ '--d': delay }}>
        <g className="bloom" style={{ animationDelay: `${delay}s` }}>
          <g className="petals">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} cx="0" cy="-17" rx="8" ry="16" transform={`rotate(${i * 45})`} fill={color} stroke={INK} strokeWidth="2.5" />
            ))}
          </g>
          <circle r="9" fill={center} stroke={INK} strokeWidth="2.5" />
        </g>
      </g>
    </g>
  )
}

function Tulip({ x, y, color, delay }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="sway" style={{ '--d': delay }}>
        <path
          className="bloom"
          style={{ animationDelay: `${delay}s` }}
          d="M-15 -4 Q-18 -26 -10 -34 L-4 -20 L0 -36 L5 -20 L11 -34 Q18 -26 15 -4 Q0 8 -15 -4 Z"
          fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round"
        />
      </g>
    </g>
  )
}

// The .drawn class (which plays the drawing animation) is added by useReveal in App.
export default function Bouquet() {
  const [love, setLove] = useState(0)
  const [floaters, setFloaters] = useState([])
  // hover plays the breeze; a tap does the same for a moment on touch screens
  const [wind, setWind] = useState(false)
  const windTimer = useRef(0)
  const blow = () => {
    setWind(true)
    clearTimeout(windTimer.current)
    windTimer.current = setTimeout(() => setWind(false), 3500)
  }

  const sendLove = () => {
    setLove((n) => n + 1)
    const batch = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 120 - 60,
      size: 18 + Math.random() * 18,
      delay: i * 0.08,
    }))
    setFloaters((f) => [...f, ...batch])
    setTimeout(() => setFloaters((f) => f.filter((h) => !batch.includes(h))), 1800)
  }

  return (
    <section className="bouquet-section">
      <button className={`bouquet-wrap ${wind ? 'wind' : ''}`} onClick={blow} aria-label="Thổi gió cho bó hoa">
        <span className="bouquet-drift" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="drift-bit" style={{ '--i': i }}>
              {i % 3 === 0 ? <span className="petal" /> : i % 3 === 1 ? <Heart fx="none" size={16} /> : <Sparkle fx="none" size={20} />}
            </span>
          ))}
        </span>
        <svg className="bouquet" viewBox="0 0 300 360" aria-hidden="true">
          <g className="flowers">
            <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round">
              <path className="stem" pathLength="1" d="M150 300 C150 240 150 190 150 125" />
              <path className="stem" pathLength="1" d="M140 300 C120 250 100 210 82 168" />
              <path className="stem" pathLength="1" d="M160 300 C180 250 205 210 222 160" />
              <path className="stem" pathLength="1" d="M146 300 C135 240 118 160 110 98" />
              <path className="stem" pathLength="1" d="M154 300 C168 240 184 160 192 100" />
            </g>
            <g stroke={INK} strokeWidth="2.5">
              <ellipse className="leaf" cx="122" cy="222" rx="7" ry="18" transform="rotate(-40 122 222)" fill="#9cc59a" />
              <ellipse className="leaf" cx="180" cy="222" rx="7" ry="18" transform="rotate(40 180 222)" fill="#9cc59a" />
              <Tulip x={110} y={100} color="#f4a6b5" delay={1.0} />
              <Tulip x={192} y={102} color="#c8474d" delay={1.1} />
              <Daisy x={82} y={162} color="#ffffff" delay={1.2} r={0.9} />
              <Daisy x={222} y={154} color="#ffd97a" center="#e88b4a" delay={1.3} r={0.9} />
              <Daisy x={150} y={120} color="#f6b9c4" delay={1.4} />
            </g>
          </g>
          <g stroke={INK} strokeWidth="2.5">
            <path className="wrap" d="M92 236 L208 236 L178 348 L122 348 Z" fill="#ead0a6" strokeLinejoin="round" />
            <path className="wrap" d="M150 240 L150 346" fill="none" opacity="0.4" />
            <g className="bow">
              <path className="wrap" d="M150 266 C130 250 118 262 128 274 C136 282 146 274 150 266 C154 274 164 282 172 274 C182 262 170 250 150 266 Z M150 266 L136 296 M150 266 L164 296" fill="#c8474d" strokeLinejoin="round" />
            </g>
          </g>
        </svg>
      </button>

      <div className="bouquet-text">
        <h2>Mãi xinh đẹp &amp; hạnh phúc nhé!</h2>
        <p>
          Cảm ơn các bạn vì đã mang thật nhiều nắng, tiếng cười và sự ấm áp đến mỗi ngày.
          Bó hoa nhỏ này là dành riêng cho các bạn đó.
        </p>
        <div className="love-wrap">
          <button className="love-btn" onClick={sendLove}>
            Gửi yêu thương <Heart size={22} />
          </button>
          {floaters.map((h) => (
            <span key={h.id} className="floater" style={{ '--x': `${h.x}px`, animationDelay: `${h.delay}s` }}>
              <Heart fx="none" size={h.size} />
            </span>
          ))}
        </div>
        <p className="love-count">{love > 0 ? `Đã gửi ${love} lần yêu thương ♡` : ' '}</p>
      </div>
    </section>
  )
}
