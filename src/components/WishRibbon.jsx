import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const WISHES = [
  'Luôn xinh đẹp',
  'Smash đâu trúng đó',
  'Hạnh phúc ngập tràn',
  'Cầu nào cũng qua lưới',
  'Rạng rỡ mỗi ngày',
  'Được yêu thương thật nhiều',
  'Trận nào cũng thắng',
  'Mãi tươi như hoa',
]

const SATIN = '#f5b2c0'
const SATIN_EDGE = '#de8396'

// The ribbon's centre line, drawn in real pixels so the text never stretches:
// it starts at the left bow, dips through the middle and climbs to the right bow.
function ribbonPath(w, h) {
  const x0 = w * 0.035
  const x1 = w * 0.965
  return `M${x0} ${h * 0.36} C${w * 0.25} ${h * 0.62} ${w * 0.38} ${h * 0.9} ${w * 0.52} ${h * 0.86} S${w * 0.85} ${h * 0.3} ${x1} ${h * 0.36}`
}

// Watercolor cherry blossom: five notched petals shading from a pale heart to
// pink tips, with a ring of golden stamens.
function Flower({ x, y, r, rot = 0, fill = 'url(#petal-pink)' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 30})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d="M0 -4 C-15 -12 -18 -30 -8 -34 L0 -28 L8 -34 C18 -30 15 -12 0 -4 Z"
          transform={`rotate(${a})`}
          fill={fill}
          stroke="#e79aab"
          strokeWidth="1.2"
        />
      ))}
      <g stroke="#d9a04a" strokeWidth="1.1" strokeLinecap="round">
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => (
          <path key={a} d="M0 -3 L0 -11" transform={`rotate(${a})`} />
        ))}
      </g>
      <g fill="#e8a92a" stroke="none">
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => (
          <circle key={a} cy="-11.5" r="1.6" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="4" fill="#f6c76a" stroke="none" />
    </g>
  )
}

function Bud({ x, y, rot }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M0 0 L0 14" stroke="#a3a66a" strokeWidth="1.5" fill="none" />
      <path d="M0 -12 C-7 -6 -6 2 0 3 C6 2 7 -6 0 -12 Z" fill="url(#petal-pink)" stroke="#e79aab" strokeWidth="1.2" />
      <path d="M-5 2 C-3 6 3 6 5 2" fill="#b8c48a" stroke="none" />
    </g>
  )
}

// Leaf with a midrib; olive green or autumn gold like the watercolor card.
function Leaf({ x, y, len, rot, gold }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0 C${len * 0.3} ${-len * 0.22} ${len * 0.75} ${-len * 0.18} ${len} 0 C${len * 0.75} ${len * 0.18} ${len * 0.3} ${len * 0.22} 0 0 Z`}
        fill={gold ? 'url(#leaf-gold)' : 'url(#leaf-green)'}
        stroke={gold ? '#c49a4c' : '#8fa36a'}
        strokeWidth="1.2"
      />
      <path d={`M2 0 L${len * 0.85} 0`} stroke={gold ? '#c49a4c' : '#8fa36a'} strokeWidth="1" fill="none" opacity="0.8" />
    </g>
  )
}

// tiny golden sprigs, like baby's breath tucked between the blossoms
function Sprig({ x, y, rot }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke="#c9a25a" strokeWidth="1.2" fill="none">
      <path d="M0 0 C4 -14 6 -26 4 -40 M3 -18 L12 -26 M5 -30 L-4 -38" />
      <g fill="#ecc06a" stroke="none">
        <circle cx="4" cy="-41" r="2.6" />
        <circle cx="12" cy="-27" r="2.2" />
        <circle cx="-4" cy="-39" r="2.2" />
      </g>
    </g>
  )
}

// Satin bow: two loops, a knot and two tails, nestled in a cluster of
// cherry blossoms and leaves.
function Bow({ x, y, scale, flip, front }) {
  const transform = `translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`
  if (front) {
    return (
      <g transform={transform} strokeLinejoin="round">
        {/* blossoms spilling below the ribbon end, in front of it */}
        <Leaf x={-40} y={52} len={56} rot={150} gold />
        <Leaf x={-10} y={58} len={50} rot={70} />
        <Sprig x={-56} y={70} rot={-140} />
        <Flower x={-28} y={56} r={20} rot={15} />
        <Flower x={6} y={74} r={14} rot={50} fill="url(#petal-pale)" />
        <Bud x={-60} y={34} rot={-100} />
      </g>
    )
  }
  return (
    <g transform={transform} strokeLinejoin="round">
      {/* bouquet behind the bow */}
      <Leaf x={-6} y={-20} len={78} rot={-115} />
      <Leaf x={6} y={-24} len={84} rot={-72} />
      <Leaf x={14} y={-14} len={64} rot={-30} gold />
      <Leaf x={-16} y={-8} len={60} rot={-160} gold />
      <Leaf x={-4} y={-30} len={50} rot={-95} gold />
      <Sprig x={30} y={-30} rot={20} />
      <Sprig x={-36} y={-34} rot={-30} />
      <Bud x={-58} y={-70} rot={-30} />
      <Bud x={58} y={-82} rot={25} />
      <Flower x={-40} y={-74} r={26} rot={10} />
      <Flower x={18} y={-88} r={21} rot={-15} fill="url(#petal-pale)" />
      <Flower x={-90} y={-44} r={18} rot={30} fill="url(#petal-pale)" />
      <Flower x={78} y={-62} r={16} rot={5} />
      <Flower x={-8} y={-56} r={15} rot={40} fill="url(#petal-pale)" />
      <g stroke={SATIN_EDGE} strokeWidth="2">
      <path d="M-4 6 C-18 44 -40 84 -52 120 C-38 110 -30 112 -18 128 C-8 84 2 44 4 8 Z" fill="url(#satin-fill)" />
      <path d="M4 6 C30 38 54 76 76 106 C80 92 90 88 102 90 C72 60 38 26 8 2 Z" fill="url(#satin-fill)" />
      <path d="M0 0 C-30 -62 -124 -64 -116 -10 C-108 32 -38 22 0 0 Z" fill="url(#satin-fill)" />
      <path d="M0 0 C30 -62 124 -64 116 -10 C108 32 38 22 0 0 Z" fill="url(#satin-fill)" />
      {/* inner folds and highlights */}
      <g fill="none" strokeLinecap="round">
        <path d="M-8 2 C-36 -6 -76 0 -96 8" stroke="#dc6f86" strokeWidth="8" opacity="0.4" />
        <path d="M8 2 C36 -6 76 0 96 8" stroke="#dc6f86" strokeWidth="8" opacity="0.4" />
        <path d="M-16 -16 C-40 -42 -82 -50 -100 -30" stroke="#fff3f6" strokeWidth="4" opacity="0.85" />
        <path d="M16 -16 C40 -42 82 -50 100 -30" stroke="#fff3f6" strokeWidth="4" opacity="0.85" />
        <path d="M-8 22 C-20 58 -34 92 -44 116" stroke="#fff3f6" strokeWidth="3" opacity="0.7" />
        <path d="M10 18 C34 48 54 76 70 98" stroke="#dc6f86" strokeWidth="3" opacity="0.35" />
      </g>
      <ellipse rx="14" ry="17" fill="url(#satin-fill)" />
      <path d="M-6 -8 C-2 -2 -2 6 -6 10" fill="none" stroke="#fff3f6" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  )
}

// A satin ribbon that curls across the page between two bows, with the
// wishes scrolling along it on an SVG textPath.
export default function WishRibbon() {
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const measureRef = useRef(null)
  const [w, setW] = useState(0)

  useLayoutEffect(() => {
    const el = wrapRef.current
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const compact = w <= 640 // same breakpoint as the CSS --ribbon-h override
  const h = compact ? 190 : 300
  const band = compact ? 46 : 76
  const font = compact ? 15 : 20
  const bowScale = compact ? 0.62 : 1.3

  // scroll the wishes along the path; one full set is the loop length
  useEffect(() => {
    if (!w || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const loop = measureRef.current.getComputedTextLength()
    let offset = 0
    let last = performance.now()
    let paused = false
    let frame
    const tick = (now) => {
      if (!paused) offset = (offset + (now - last) * 0.045) % loop
      last = now
      textRef.current.setAttribute('startOffset', -offset)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const el = wrapRef.current
    const pause = () => { paused = true }
    const resume = () => { paused = false }
    el.addEventListener('pointerenter', pause)
    el.addEventListener('pointerleave', resume)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointerenter', pause)
      el.removeEventListener('pointerleave', resume)
    }
  }, [w])

  const d = w ? ribbonPath(w, h) : ''
  const set = (key) =>
    WISHES.map((wish, i) => (
      <tspan key={`${key}${i}`}>
        {wish}
        <tspan fill={i % 2 ? '#e0566a' : '#e8a92a'}>{i % 2 ? '   ♥   ' : '   ✿   '}</tspan>
      </tspan>
    ))

  return (
    <div className="ribbon" ref={wrapRef} style={{ height: h }} aria-label={WISHES.join(', ')}>
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          <defs>
            <linearGradient id="satin-fill" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#fdd9e0" />
              <stop offset="0.5" stopColor="#f3a5b6" />
              <stop offset="1" stopColor="#e07a91" />
            </linearGradient>
            <radialGradient id="petal-pink">
              <stop offset="0.15" stopColor="#fff5f7" />
              <stop offset="0.6" stopColor="#f9c9d3" />
              <stop offset="1" stopColor="#f09cae" />
            </radialGradient>
            <radialGradient id="petal-pale">
              <stop offset="0.2" stopColor="#fffafb" />
              <stop offset="1" stopColor="#f8cfd8" />
            </radialGradient>
            <linearGradient id="leaf-green" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#9fb27a" />
              <stop offset="1" stopColor="#cdd6a4" />
            </linearGradient>
            <linearGradient id="leaf-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d6ad62" />
              <stop offset="1" stopColor="#f0d79c" />
            </linearGradient>
            <path id="ribbon-line" d={d} />
          </defs>
          <Bow x={w * 0.035} y={h * 0.36} scale={bowScale} />
          <Bow x={w * 0.965} y={h * 0.36} scale={bowScale} flip />

          {/* shadow, the darker underside folding out below, then the pale satin face with stitched edges */}
          <use href="#ribbon-line" fill="none" stroke="rgba(200, 90, 110, 0.16)" strokeWidth={band + 10} transform="translate(0 10)" />
          <use href="#ribbon-line" fill="none" stroke="#e6869b" strokeWidth={band * 0.6} transform={`translate(0 ${band * 0.3})`} />
          <use href="#ribbon-line" fill="none" stroke="#e993a6" strokeWidth={band} />
          <use href="#ribbon-line" fill="none" stroke="#fbe1e6" strokeWidth={band - 3} />
          <use href="#ribbon-line" fill="none" stroke="#f3aebd" strokeWidth={band - 8} strokeOpacity="0.55" />
          <use href="#ribbon-line" fill="none" stroke="#fde9ed" strokeWidth={band - 11} />
          <use href="#ribbon-line" fill="none" stroke="#fff" strokeWidth={band * 0.28} strokeOpacity="0.55" transform={`translate(0 ${-band * 0.14})`} />

          <text className="ribbon-text" fontSize={font} dominantBaseline="central">
            <textPath ref={textRef} href="#ribbon-line">
              {set('a')}
              {set('b')}
            </textPath>
          </text>
          {/* invisible copy of one set, only used to measure the loop length */}
          <text ref={measureRef} className="ribbon-text" fontSize={font} visibility="hidden" x="-9999">
            {set('m')}
          </text>

          <Bow x={w * 0.035} y={h * 0.36} scale={bowScale} front />
          <Bow x={w * 0.965} y={h * 0.36} scale={bowScale} flip front />
        </svg>
      )}
    </div>
  )
}
