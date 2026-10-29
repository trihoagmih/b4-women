import { Star, Heart } from './Doodles.jsx'

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

// A tilted paper ribbon of little wishes scrolling sideways. The list is
// rendered twice so translating by -50% loops seamlessly.
export default function WishRibbon() {
  const items = [...WISHES, ...WISHES]
  return (
    <div className="ribbon" aria-label={WISHES.join(', ')}>
      <div className="ribbon-track" aria-hidden="true">
        {items.map((w, i) => (
          <span key={i} className="ribbon-item">
            {w}
            {i % 2 ? <Heart fx="none" size={18} /> : <Star fx="none" size={20} />}
          </span>
        ))}
      </div>
    </div>
  )
}
