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

// Painted watercolor bows (square, transparent). KNOT is where the bow's knot
// sits in each image, as a fraction of its size; the ribbon runs across it.
const BOWS = { left: 'ribbon/bow-left.webp', right: 'ribbon/bow-right.webp' }
const KNOT = { x: 0.49, y: 0.43 }

// The ribbon's centre line, drawn in real pixels so the text never stretches.
// It starts out in the left bow's outer loop, crosses the knot, dips through
// the middle and climbs back across the right knot into its outer loop.
function ribbonCurves(w, h, x0, lift) {
  const y = h * 0.36 - lift
  // the dip stays shallow enough that the ribbon and the silk below it fit on the first screen
  const a = [[x0, y], [w * 0.25, h * 0.56], [w * 0.38, h * 0.78], [w * 0.52, h * 0.74]]
  // second curve starts smoothly where the first ends (its first handle mirrors the last)
  const b = [a[3], [w * 0.66, h * 0.7], [w * 0.85, h * 0.3], [w - x0, y]]
  return [a, b]
}

function ribbonPath(curves) {
  const [a, b] = curves
  return `M${a[0]} C${a[1]} ${a[2]} ${a[3]} C${b[1]} ${b[2]} ${b[3]}`
}

// point and tangent on one cubic Bézier at t
function cubic([p0, p1, p2, p3], t) {
  const s = 1 - t
  const at = (i) => s * s * s * p0[i] + 3 * s * s * t * p1[i] + 3 * s * t * t * p2[i] + t * t * t * p3[i]
  const tan = (i) => 3 * s * s * (p1[i] - p0[i]) + 6 * s * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i])
  return [at(0), at(1), tan(0), tan(1)]
}

// A sheer silk strip winding around the ribbon: it follows the ribbon's curve,
// swinging above and below it in a slow wave, and twists as it goes, so it
// pinches thin wherever it turns edge-on and opens out flat in between. It
// tapers to nothing at both ends. Returns path data for the strip's outline,
// its upper edge and its centre line (for a sheen), between `from` and `to`
// along its length (0 to 1), so a stretch of it can be drawn on its own.
function silkPaths(curves, { amp, width, waves, twists, phase }, from = 0, to = 1) {
  const n = Math.max(8, Math.round(220 * (to - from)))
  const upper = []
  const lower = []
  const centre = []
  for (let i = 0; i <= n; i++) {
    const u = from + ((to - from) * i) / n
    const [x, y, dx, dy] = cubic(curves[u < 0.5 ? 0 : 1], u < 0.5 ? u * 2 : u * 2 - 1)
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const taper = Math.min(1, u / 0.1, (1 - u) / 0.1)
    const off = amp * Math.sin(Math.PI * 2 * waves * u + phase) * taper
    const open = Math.abs(Math.cos(Math.PI * 2 * twists * u + phase * 0.7))
    const half = (width * (0.12 + 0.88 * open) * taper) / 2
    const pt = (o) => `${(x + nx * o).toFixed(1)} ${(y + ny * o).toFixed(1)}`
    upper.push(pt(off - half))
    lower.push(pt(off + half))
    centre.push(pt(off - half * 0.3))
  }
  return {
    body: `M${upper.join(' L')} L${lower.reverse().join(' L')} Z`,
    edge: `M${upper.join(' L')}`,
    centre: `M${centre.join(' L')}`,
  }
}

// The stretches where the strip comes round in front of the ribbon. It crosses
// the ribbon wherever its wave passes zero; every other crossing goes in
// front (`front` picks which set). Each stretch runs from one wave crest to
// the next, so it starts and ends well clear of the ribbon, and only crossings
// away from the bows are used.
function frontStretches({ waves, phase }, front) {
  const quarter = 1 / (4 * waves)
  const out = []
  for (let k = 0; k <= waves * 2 + 1; k++) {
    if ((k % 2 === 0) !== front) continue
    const u = (k * Math.PI - phase) / (2 * Math.PI * waves)
    if (u > 0.12 && u < 0.88) out.push([u - quarter * 0.95, u + quarter * 0.95])
  }
  return out
}

// tilted about its knot, so it leans along the ribbon's slope
function Bow({ x, y, size, src, tilt = 0 }) {
  return <image href={src} x={x - size * KNOT.x} y={y - size * KNOT.y} width={size} height={size} transform={`rotate(${tilt} ${x} ${y})`} />
}

// Horizontal fade: transparent before `a`, opaque from `b` until `w - b`,
// transparent again after `w - a`. Used to dissolve the ribbon's ends.
function EdgeFade({ id, w, a, b }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2="0">
      <stop offset={a / w} stopColor="#fff" stopOpacity="0" />
      <stop offset={b / w} stopColor="#fff" />
      <stop offset={(w - b) / w} stopColor="#fff" />
      <stop offset={(w - a) / w} stopColor="#fff" stopOpacity="0" />
    </linearGradient>
  )
}

// A watercolor satin ribbon that curls across the page, painted over the knot
// of a bow at each end so the blossoms peek out above and below it, with the
// wishes scrolling along it on an SVG textPath. Three stacked SVGs: paper wash
// and bows, the filtered ribbon (static), and the moving text on top, so only
// the text repaints each frame.
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
  const band = compact ? 34 : 76
  const font = compact ? 13 : 20
  // the bows grow with the screen, so on a phone they leave room for the ribbon between them
  const bowSize = Math.round(Math.min(390, Math.max(110, w * 0.32)))
  // keep the knot far enough in that the whole bow stays on screen
  const inset = Math.round(bowSize * 0.5)
  const knotY = h * 0.36
  // lift each bow so its blossoms sit above the ribbon and the ribbon crosses
  // just under them, through the loops and tails, as in the reference
  const bowY = knotY - bowSize * 0.17
  // the ribbon reaches out past the knot into each bow's outer loop
  const start = Math.round(bowSize * 0.16)

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

  const curves = ribbonCurves(w, h, start, band * 0.2)
  const d = w ? ribbonPath(curves) : ''
  // a main silk strip and a finer one out of step with it, weaving around the
  // ribbon: drawn whole behind it, plus the stretches that come round in front
  // (the two strips alternate, so where one passes in front the other goes behind)
  // fewer turns on a short ribbon (three across a desktop, one and a half on a
  // phone), and only the main strip on small screens, where two would tangle
  const waves = Math.min(3, Math.max(1.5, w / 530))
  const strands = [
    { amp: band * 0.85, width: band * 0.42, waves, twists: waves * 1.5, phase: 0.9 },
    ...(compact ? [] : [{ amp: band * 0.7, width: band * 0.22, waves: waves * 0.83, twists: waves * 1.17, phase: 3.6 }]),
  ]
  const silk = w ? strands.map((s) => silkPaths(curves, s)) : []
  const silkFront = w
    ? strands.map((s, i) => frontStretches(s, i === 0).map(([a, b]) => silkPaths(curves, s, a, b)))
    : []
  const silkStrand = ({ body, edge, centre }, i, key) => (
    <g key={key} opacity={i ? 0.7 : 0.88}>
      <path d={body} fill="url(#silk-sheen)" />
      <path d={centre} fill="none" stroke="#fb9ca2" strokeWidth={band * 0.06} strokeOpacity="0.8" strokeLinecap="round" />
      <path d={edge} fill="none" stroke="#cf4347" strokeWidth="1" strokeOpacity="0.55" />
    </g>
  )
  const set = (key) =>
    WISHES.map((wish, i) => (
      <tspan key={`${key}${i}`}>
        {wish}
        <tspan fill={i % 2 ? '#e0566a' : '#e8a92a'}>{i % 2 ? '   ♥   ' : '   ✿   '}</tspan>
      </tspan>
    ))
  const layer = { width: w, height: h, viewBox: `0 0 ${w} ${h}`, 'aria-hidden': true }

  return (
    <div className="ribbon" ref={wrapRef} style={{ height: h }} aria-label={WISHES.join(', ')}>
      {w > 0 && (
        <>
          <svg {...layer}>
            <defs>
              <path id="ribbon-line" d={d} />
              {/* filter areas in page pixels so a blur is never cut off along a straight edge */}
              <filter id="silk-soft" filterUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <feGaussianBlur stdDeviation="0.8" />
              </filter>
              <filter id="silk-front" filterUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <feGaussianBlur stdDeviation="1.8" />
              </filter>
              <linearGradient id="silk-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2="0">
                {/* watermelon pink, sampled from the swatch: #e96768 with its darker and lighter shades */}
                <stop offset="0" stopColor="#e96768" />
                <stop offset="0.3" stopColor="#f68c91" />
                <stop offset="0.55" stopColor="#e4504e" />
                <stop offset="0.8" stopColor="#f68c91" />
                <stop offset="1" stopColor="#e96768" />
              </linearGradient>
              {/* a wide, very soft pink glow around each bow */}
              <filter id="ribbon-glow" filterUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <feGaussianBlur stdDeviation={band * 0.55} />
              </filter>
              {/* mottled pigment across the ribbon's face, like a wash that dried unevenly */}
              <filter id="wc-satin" filterUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <feTurbulence type="fractalNoise" baseFrequency="0.006 0.04" numOctaves="3" seed="2" result="noise" />
                <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.91  0 0 0 0 0.5  0 0 0 0 0.47  0 0 0 1.5 -0.55" result="blots" />
                <feComposite in="blots" in2="SourceAlpha" operator="in" result="stain" />
                <feMerge result="stained">
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="stain" />
                </feMerge>
                {/* just soften the edges a touch so they read as painted, not vector */}
                <feGaussianBlur in="stained" stdDeviation="0.5" />
              </filter>
              <EdgeFade id="ribbon-ends" w={w} a={start} b={start + bowSize * 0.14} />
              <mask id="ribbon-ends-mask" maskUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <rect x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3} fill="url(#ribbon-ends)" />
              </mask>
              <EdgeFade id="ribbon-text-fade" w={w} a={start + bowSize * 0.12} b={start + bowSize * 0.26} />
              <mask id="ribbon-text-mask" maskUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <rect x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3} fill="url(#ribbon-text-fade)" />
              </mask>
              {/* just the ribbon's own shape: the silk drawn in front only shows where it crosses the ribbon */}
              <mask id="ribbon-band-mask" maskUnits="userSpaceOnUse" x={-bowSize} y={-h} width={w + bowSize * 2} height={h * 3}>
                <use href="#ribbon-line" fill="none" stroke="#fff" strokeWidth={band + 2} />
              </mask>
            </defs>

            <g filter="url(#ribbon-glow)" fill="#f2a59c">
              <ellipse cx={inset} cy={bowY + bowSize * 0.08} rx={bowSize * 0.46} ry={bowSize * 0.3} opacity="0.14" />
              <ellipse cx={w - inset} cy={bowY + bowSize * 0.08} rx={bowSize * 0.46} ry={bowSize * 0.3} opacity="0.14" />
            </g>

            <Bow x={inset} y={bowY} size={bowSize} src={BOWS.left} tilt={12} />
            <Bow x={w - inset} y={bowY} size={bowSize} src={BOWS.right} tilt={-12} />

            {/* sheer silk winding around behind the ribbon, melting into the bows at the ends */}
            <g mask="url(#ribbon-ends-mask)" filter="url(#silk-soft)">
              {silk.map((s, i) => silkStrand(s, i, i))}
            </g>
          </svg>

          {/* the ribbon, painted over the knots; its ends dissolve into the bows' loops */}
          <svg {...layer}>
            <g mask="url(#ribbon-ends-mask)">
              <g filter="url(#wc-satin)">
                {/* the satin face shading from the bows' coral at the edges to cream in
                    the middle, with no hard outline */}
                <use href="#ribbon-line" fill="none" stroke="#ec8780" strokeOpacity="0.8" strokeWidth={band} />
                <use href="#ribbon-line" fill="none" stroke="#f2a59d" strokeOpacity="0.85" strokeWidth={band - 6} />
                <use href="#ribbon-line" fill="none" stroke="#f7c6be" strokeOpacity="0.9" strokeWidth={band - 13} />
                <use href="#ribbon-line" fill="none" stroke="#fbe2dc" strokeOpacity="0.92" strokeWidth={band - 22} />
                <use href="#ribbon-line" fill="none" stroke="#fff" strokeWidth={band * 0.24} strokeOpacity="0.35" transform={`translate(0 ${-band * 0.14})`} />
              </g>
              {/* gold dotted stitching just inside both edges */}
              <use href="#ribbon-line" fill="none" stroke="#e2b25e" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" strokeDasharray="0.1 6" transform={`translate(0 ${-(band / 2 - 7)})`} />
              <use href="#ribbon-line" fill="none" stroke="#e2b25e" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" strokeDasharray="0.1 6" transform={`translate(0 ${band / 2 - 7})`} />
            </g>
          </svg>

          {/* the stretches of silk that wrap round in front of the ribbon (below the words, so they stay readable) */}
          <svg {...layer}>
            <g mask="url(#ribbon-band-mask)">
              {/* paler and a little out of focus, like sheer fabric nearer the eye */}
              <g filter="url(#silk-front)" opacity="0.6">
                {silkFront.map((pieces, i) => pieces.map((s, j) => silkStrand(s, i, `${i}-${j}`)))}
              </g>
            </g>
          </svg>

          <svg {...layer}>
            <text className="ribbon-text" fontSize={font} dominantBaseline="central" mask="url(#ribbon-text-mask)">
              <textPath ref={textRef} href="#ribbon-line">
                {set('a')}
                {set('b')}
              </textPath>
            </text>
            {/* invisible copy of one set, only used to measure the loop length */}
            <text ref={measureRef} className="ribbon-text" fontSize={font} visibility="hidden" x="-9999">
              {set('m')}
            </text>
          </svg>
        </>
      )}
    </div>
  )
}
