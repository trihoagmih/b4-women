import { Sparkle, Star } from './Doodles.jsx'

export default function LadyCard({ lady, index, onOpen, current }) {
  return (
    <button
      id={`lady-${lady.id}`}
      className="card reveal"
      // an attribute rather than a class: useReveal adds .in to the class list
      // directly, and React rewriting className would wipe it out
      data-current={current || undefined}
      style={{ '--tilt': `${lady.tilt}deg`, '--accent': lady.color, '--i': index }}
      onClick={() => onOpen(lady)}
    >
      <span className="tape" />
      <Sparkle size={42} className="card-spark card-spark-l" color={lady.color} />
      <Star size={34} className="card-spark card-spark-r" />

      <span className="card-img">
        <img src={lady.img} alt={lady.nickname} loading="lazy" />
      </span>
      <span className="card-name">{lady.nickname}</span>
      <span className="card-tag">{lady.tag}</span>
      <span className="card-cta">mở lời chúc ✉</span>
    </button>
  )
}
