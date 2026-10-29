import { Star, Sparkle, Heart, Blob } from './Doodles.jsx'
import { ladies } from '../ladies.js'

export default function Hero() {
  return (
    <header className="hero">
      <Star size={64} className="float hero-d1" />
      <Sparkle size={60} className="float hero-d2" />
      <Star size={40} className="float hero-d3" />
      <Heart size={44} className="float hero-d4" />
      <Sparkle size={48} className="float hero-d5" />

      <p className="hero-kicker">Ngày Phụ nữ Việt Nam · 20/10</p>

      {/* each line is "written" left-to-right with a clip-path wipe so cursive joins stay intact */}
      <h1 className="hero-poem">
        <span className="poem-line">Hoa tặng ngày lễ là quà</span>
        <span className="poem-line">
          Hoa tặng người thường thì là{' '}
          <span className="poem-hl">
            <Blob color="#ffd06b" />
            yêu thương
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
          >
            <img src={l.img} alt="" />
          </a>
        ))}
      </div>

      <a href="#gallery" className="scroll-hint">
        <span className="scroll-text">Còn quà bất ngờ phía dưới nè</span>
        <svg className="scroll-arrow" viewBox="0 0 40 60" width="26" height="40" aria-hidden="true">
          <path
            d="M20 4 C6 14 34 22 20 32 C10 39 18 46 20 54 M12 46 L20 55 L28 46"
            fill="none" stroke="#c8474d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </a>
    </header>
  )
}
