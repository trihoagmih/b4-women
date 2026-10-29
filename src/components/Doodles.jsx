// Hand-drawn doodles, roughened by a still noise filter so their lines wobble
// like ink. Moving/transient doodles use fx="none" to skip the filter.
// (There's deliberately no animated "boiling" variant: an SVG <animate> keeps
// the page restyling every frame even when nothing uses the filter.)
const FX = { still: 'url(#rough-still)', none: undefined }

export function SvgFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
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
        fill={color} stroke="#4a2c25" strokeWidth="5" strokeLinejoin="round" filter={FX[fx]}
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
      <g transform="rotate(-28 20 20)" stroke="#4a2c25" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" filter="url(#rough-still)">
        <path d="M11 3 L29 3 L24.5 25 L15.5 25 Z" fill="#fff" />
        <path d="M15.5 3 L17.8 25 M20 3 L20 25 M24.5 3 L22.2 25 M12.6 11 L27.4 11" fill="none" strokeWidth="1.4" />
        <path d="M15.5 25 Q15.5 35 20 35 Q24.5 35 24.5 25 Z" fill="#f2b01e" />
      </g>
    </svg>
  )
}

// Five-petal cherry blossom, watercolor pink with a soft brown outline.
export function Blossom({ size = 40, color = '#f7b6c2', className = '', style }) {
  return (
    <svg className={`doodle ${className}`} style={style} width={size} height={size} viewBox="-50 -50 100 100" aria-hidden="true">
      <g stroke="#c9707f" strokeWidth="2.5" strokeLinejoin="round">
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d="M0 -6 C-14 -18 -14 -38 -4 -44 L0 -38 L4 -44 C14 -38 14 -18 0 -6 Z" fill={color} transform={`rotate(${i * 72})`} />
        ))}
      </g>
      <circle r="7" fill="#ffd06b" stroke="#c9707f" strokeWidth="2" />
      <g stroke="#c9707f" strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d="M0 -9 L0 -16" transform={`rotate(${i * 72 + 36})`} />
        ))}
      </g>
    </svg>
  )
}

// A loose pink petal floating on the page.
export function Petal({ size = 22, className = '', style }) {
  return (
    <svg className={`doodle ${className}`} style={style} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 32 C2 18 14 4 32 6 C36 20 26 36 8 32 Z" fill="#f7c2cc" stroke="#e58fa0" strokeWidth="1.5" />
      <path d="M10 30 C16 22 22 16 30 9" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
