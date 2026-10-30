// The little speech bubbles that pop up around a lady's photo with her
// catchphrases. Each bubble's outline is an SVG stretched behind the text, so
// it grows with whatever it says.

// a spiky "shout" outline, for the loud ones
const burst = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2
  const r = i % 2 ? 72 : 98
  return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r * 0.82).toFixed(1)}`
}).join(' ')

const shapes = {
  // a wobbly blob with a hooked tail
  blob: {
    box: '0 0 200 120',
    d: 'M30 12 C70 2 140 6 175 14 C196 20 199 70 188 84 C180 94 160 96 140 95 C146 104 152 110 160 116 C140 114 126 106 118 96 C90 98 50 100 26 92 C6 86 2 40 8 26 C12 16 20 14 30 12 Z',
  },
  // a fat pill with a pointy tail
  pill: {
    box: '0 0 200 110',
    d: 'M40 8 H160 C186 8 196 26 196 45 C196 66 185 82 160 82 H74 L46 106 L54 82 H40 C15 82 4 66 4 45 C4 26 15 8 40 8 Z',
  },
  // a puffy thought cloud (its trail of little puffs is drawn in CSS)
  cloud: {
    box: '0 0 200 120',
    d: 'M42 96 C16 100 4 78 18 64 C4 50 16 24 42 30 C46 10 78 4 92 20 C106 2 142 4 150 24 C176 16 198 40 184 58 C200 72 188 100 162 96 C152 114 120 116 104 102 C88 116 56 114 42 96 Z',
  },
  burst: { box: '-100 -100 200 200', points: burst },
}

export default function ChatBubbles({ quotes }) {
  return (
    <div className="chats" aria-hidden="true">
      {quotes.map((q, i) => {
        const s = shapes[q.shape]
        return (
          <span
            key={i}
            className={`chat chat-${q.shape} ${q.flip ? 'flip' : ''}`}
            style={{ ...q.at, '--fill': q.fill, '--tilt': `${q.tilt || 0}deg`, '--delay': `${0.7 + i * 0.55}s` }}
          >
            <span className="chat-float" style={{ '--bob': `${2.6 + i * 0.4}s` }}>
              <svg viewBox={s.box} preserveAspectRatio="none">
                {s.d ? <path d={s.d} /> : <polygon points={s.points} />}
              </svg>
              <span className="chat-text">{q.text}</span>
            </span>
          </span>
        )
      })}
    </div>
  )
}
