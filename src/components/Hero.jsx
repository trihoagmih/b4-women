import { Star, Sparkle, Heart, Blossom, Petal } from './Doodles.jsx'
import { ladies } from '../ladies.js'

// scattered petals drifting around the title, like the watercolor card
const PETALS = [
  { top: '18%', left: '17%', rotate: -30, size: 26 },
  { top: '30%', left: '11%', rotate: 20, size: 20 },
  { top: '22%', right: '13%', rotate: 60, size: 24 },
  { top: '52%', left: '24%', rotate: -10, size: 18 },
  { top: '50%', right: '22%', rotate: 110, size: 20 },
  { top: '62%', right: '8%', rotate: 30, size: 24 },
  { top: '70%', left: '6%', rotate: -60, size: 22 },
]

// center the chosen card on screen, then wiggle it once the scroll settles
function goToCard(e, id) {
  const card = document.getElementById(`lady-${id}`)
  if (!card) return
  e.preventDefault()
  card.classList.remove('spotlight')
  card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

  let done = false
  const play = () => {
    if (done) return
    done = true
    window.removeEventListener('scrollend', play)
    void card.offsetWidth // restart the animation if it's clicked again
    card.classList.add('spotlight')
    card.focus({ preventScroll: true })
    setTimeout(() => card.classList.remove('spotlight'), 1800)
  }
  window.addEventListener('scrollend', play)
  setTimeout(play, 1000) // fallback: no scrollend support, or already in place
}

export default function Hero() {
  return (
    <header className="hero">
      <Star size={64} className="float hero-d1" />
      <Sparkle size={60} className="float hero-d2" />
      <Star size={40} className="float hero-d3" />
      <Heart size={36} className="float hero-d4" />
      <Sparkle size={48} className="float hero-d5" />
      {PETALS.map(({ size, rotate, ...pos }, i) => (
        <Petal key={i} size={size} className={`hero-petal ${i >= 4 ? 'hero-petal-extra' : ''}`} style={{ ...pos, '--r': `${rotate}deg`, animationDelay: `${-i * 1.3}s` }} />
      ))}

      <p className="hero-kicker">
        <Heart size={16} color="#e0566a" /> Ngày Phụ nữ Việt Nam · 20/10 <Heart size={16} color="#e0566a" />
      </p>

      {/* each line is "written" left-to-right with a clip-path wipe so cursive joins stay intact */}
      <h1 className="hero-poem">
        <span className="poem-line">
          <Blossom size={40} className="poem-flower" />
          Hoa tặng ngày lễ là quà
        </span>
        <span className="poem-line">
          Hoa tặng ngày thường thì là{' '}
          <span className="poem-hl">
            yêu thương
            {/* translucent brush stroke under the words: full-bodied under "yêu",
                dipping beneath the g, then thinning out into a little heart */}
            <svg className="hl-swash" viewBox="0 0 320 40" aria-hidden="true">
              <path
                d="M6 20 C60 8 120 14 190 28 C230 36 262 30 290 16 C262 34 230 40 190 33 C120 20 60 14 6 20 Z"
                fill="#ee8fa0"
                opacity="0.6"
              />
              <path
                d="M288 17 C292 12 296 10 300 13 C300 7 308 5 311 10 C314 15 306 20 298 21 C294 21 291 19 288 17"
                fill="none"
                stroke="#ec8c9c"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </svg>
            {/* the g's exit stroke loops up into an open heart */}
            <svg className="hl-heart" viewBox="0 0 50 44" aria-hidden="true">
              <defs>
                <linearGradient id="hl-heart-ink" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#e0566a" />
                  <stop offset="1" stopColor="#f08a9a" />
                </linearGradient>
              </defs>
              <path
                d="M0 38 C8 35 13 27 12 19 C10 8 23 2 27 12 C30 2 45 3 45 13 C45 24 33 32 24 41"
                fill="none"
                stroke="url(#hl-heart-ink)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </h1>

      <p className="hero-sub">
        Gửi đến những cô gái đáng yêu nhất — luôn cười tươi, luôn rực rỡ, luôn là chính mình.
      </p>

      <div className="hero-stickers">
        {ladies.map((l, i) => (
          <a
            key={l.id}
            href={`#lady-${l.id}`}
            className="mini-sticker"
            style={{ animationDelay: `${i * 0.25}s`, '--accent': l.color }}
            aria-label={l.nickname}
            onClick={(e) => goToCard(e, l.id)}
          >
            <img src={l.thumb} alt="" width="96" height="96" fetchpriority="high" decoding="async" />
          </a>
        ))}
      </div>

      <a href="#gallery" className="scroll-hint">
        <span className="scroll-text">
          <Heart size={14} color="#e0566a" /> Còn quà bất ngờ phía dưới nè <Heart size={14} color="#e0566a" />
        </span>
        <svg className="scroll-arrow" viewBox="0 0 40 60" width="26" height="40" aria-hidden="true">
          <path
            d="M20 4 C6 14 34 22 20 32 C10 39 18 46 20 54 M12 46 L20 55 L28 46"
            fill="none" stroke="#e0566a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </a>
    </header>
  )
}
