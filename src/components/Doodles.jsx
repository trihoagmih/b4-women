// Hand-drawn doodles. The "rough" filter re-seeds its noise a few times a second,
// which gives lines that gently "boil" like a hand-drawn animation. That repaints
// every tick, so it is opt-in (fx="boil"); moving/transient doodles use fx="none".
const FX = { boil: 'url(#rough)', still: 'url(#rough-still)', none: undefined }

export function SvgFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="1">
            <animate attributeName="seed" values="1;4;7;2" dur="0.9s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
        <filter id="rough-still">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>
    </svg>
  )
}

export function Star({ fx = 'still', size = 40, color = '#f2b01e', className = '', style }) {
  return (
    <svg className={`doodle ${className}`} style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 10 L60.6 37.4 L90 39 L67.1 57.6 L74.7 86 L50 70 L25.3 86 L32.9 57.6 L10 39 L39.4 37.4 Z M50 10 L52 4"
        fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter={FX[fx]}
      />
    </svg>
  )
}

export function Sparkle({ fx = 'still', size = 40, color = '#f2b01e', className = '', style }) {
  return (
    <svg className={`doodle ${className}`} style={style} width={size} height={size} viewBox="0 0 60 60" aria-hidden="true">
      <g stroke={color} strokeWidth="5.5" strokeLinecap="round" filter={FX[fx]}>
        <line x1="8" y1="22" x2="20" y2="32" />
        <line x1="30" y1="6" x2="31" y2="24" />
        <line x1="52" y1="18" x2="41" y2="31" />
      </g>
    </svg>
  )
}

export function Heart({ fx = 'still', size = 40, color = '#f29b9b', className = '', style }) {
  return (
    <svg className={`doodle ${className}`} style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 85 C20 62 8 42 22 26 C34 13 48 22 50 32 C52 22 66 13 78 26 C92 42 80 62 50 85 Z"
        fill={color} stroke="#2b2321" strokeWidth="5" strokeLinejoin="round" filter={FX[fx]}
      />
    </svg>
  )
}

// A soft watercolor puddle used behind headings. Plain CSS gradient (no SVG
// filter) so it costs nothing to repaint while text animates over it.
export function Blob({ color = '#ffd97a', className = '' }) {
  return <span className={`blob ${className}`} style={{ '--blob': color }} aria-hidden="true" />
}

// Hand-drawn shuttlecock for the club sign-off.
export function Shuttlecock({ size = 34, className = '' }) {
  return (
    <svg className={`doodle ${className}`} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <g transform="rotate(-28 20 20)" stroke="#2b2321" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" filter="url(#rough-still)">
        <path d="M11 3 L29 3 L24.5 25 L15.5 25 Z" fill="#fff" />
        <path d="M15.5 3 L17.8 25 M20 3 L20 25 M24.5 3 L22.2 25 M12.6 11 L27.4 11" fill="none" strokeWidth="1.4" />
        <path d="M15.5 25 Q15.5 35 20 35 Q24.5 35 24.5 25 Z" fill="#f2b01e" />
      </g>
    </svg>
  )
}
