import { useState } from 'react'
import { Blob, Heart, Sparkle } from './Doodles.jsx'
import { shops, orderConfig } from '../drinks.js'

const INK = '#4a2c25'

// A little hand-drawn cup, tinted with the drink's color.
function Cup({ color, size = 64 }) {
  return (
    <svg className="doodle" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M36 4 L32 18" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M14 18 H50 L45 58 Q32 62 19 58 Z" fill="#fffaf3" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M17 30 H47 L44.5 56 Q32 60 19.5 56 Z" fill={color} />
      <g fill={INK}>
        <circle cx="25" cy="51" r="2.6" /><circle cx="32" cy="53" r="2.6" /><circle cx="39" cy="51" r="2.6" />
        <circle cx="28.5" cy="46" r="2.6" /><circle cx="35.5" cy="46" r="2.6" />
      </g>
      <path d="M14 18 H50 L45 58 Q32 62 19 58 Z" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M11 18 Q32 10 53 18" fill="#fcd3db" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

// Every order is also a vote for its shop. The votes live only in the ntfy
// topic (title "🧋 <name> → <shop>"), never on the page, so voting stays
// anonymous for the girls. When a vote is sent we read the earlier ones back
// from ntfy's cache (about 12 hours) so the notification carries the tally.
const TITLE_SEP = ' → '
const TOPIC_URL = `https://ntfy.sh/${encodeURIComponent(orderConfig.ntfyTopic)}`

// [{ voter, shop }], latest vote per voter
async function fetchVotes() {
  try {
    const res = await fetch(`${TOPIC_URL}/json?poll=1&since=all`)
    if (!res.ok) return []
    const latest = new Map()
    for (const line of (await res.text()).split('\n')) {
      if (!line.trim()) continue
      const m = JSON.parse(line)
      const [voter, shop] = (m.title || '').replace(/^🧋\s*/, '').split(TITLE_SEP)
      if (m.event !== 'message' || !voter || !shop) continue
      latest.set(voter, { voter, shop }) // later messages overwrite: one vote each
    }
    return [...latest.values()]
  } catch {
    return []
  }
}

// [{ shop, count }] sorted by votes, most first
function tallyOf(votes) {
  const by = new Map()
  for (const v of votes) by.set(v.shop, (by.get(v.shop) || 0) + 1)
  return [...by].map(([shop, count]) => ({ shop, count })).sort((a, b) => b.count - a.count)
}

export default function DrinkMenu({ ladies }) {
  const [who, setWho] = useState(null) // lady id, or 'other'
  const [otherName, setOtherName] = useState('')
  const [shopId, setShopId] = useState(null) // shop id, or 'other'
  const [otherShop, setOtherShop] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | fallback

  const lady = ladies.find((l) => l.id === who)
  const name = who === 'other' ? otherName.trim() : lady?.nickname
  const realName = who === 'other' ? name : lady?.realName || name // what the notification says
  const shop = shops.find((s) => s.id === shopId)
  const shopName = shopId === 'other' ? otherShop.trim() : shop?.name
  const ready = Boolean(name && shopName)

  const orderText = (by) => `${by} vote: ${shopName}`
  // the copy-and-paste fallback is shown on the page, so it keeps the nickname
  const message = ready ? orderText(name) : ''

  async function fallback() {
    try { await navigator.clipboard.writeText(message) } catch { /* shown on screen anyway */ }
    setStatus('fallback')
    if (orderConfig.contactUrl) window.open(orderConfig.contactUrl, '_blank', 'noreferrer')
  }

  async function send() {
    if (!ready || status === 'sending') return
    if (!orderConfig.ntfyTopic) return fallback()
    setStatus('sending')
    try {
      // tally including this vote, so the notification says who's winning
      const others = (await fetchVotes()).filter((v) => v.voter !== realName)
      const lead = tallyOf([...others, { voter: realName, shop: shopName }])
        .map((t) => `${t.shop} ${t.count}`).join(' · ')
      const res = await fetch('https://ntfy.sh/', {
        method: 'POST',
        body: JSON.stringify({
          topic: orderConfig.ntfyTopic,
          title: `🧋 ${realName}${TITLE_SEP}${shopName}`,
          message: `${orderText(realName)}\n\n📊 Vote: ${lead}`,
          tags: ['bubble_tea'],
        }),
      })
      if (!res.ok) throw new Error(res.status)
      setStatus('sent')
    } catch {
      fallback()
    }
  }

  function reset() {
    setStatus('idle')
  }

  return (
    <section id="drinks" className="drinks">
      <h2 className="section-title reveal">
        <Blob color="#ffd97a" />
        <span>Uống gì để còn đánh tiếp?</span>
      </h2>
      <p className="section-sub reveal">
        Vote quán đi mấy bà, quán nào nhiều phiếu B4 bao (ví hơi mỏng, vote nhẹ tay thôi) <Heart size={22} />
      </p>

      <div className="drinks-layout">
        {status === 'sent' ? (
          <div className="order-card thanks in" role="status">
            <div className="thanks-art" aria-hidden="true">
              <Sparkle size={34} />
              <Cup color={shop?.color || '#ead0a6'} size={84} />
              <Heart size={34} />
            </div>
            <p className="thanks-title">Cảm ơn {name} nha!</p>
            <p className="thanks-text">Phiếu của bạn đã được gửi. Kết quả sẽ được công bố sau nha ♥</p>
            <button type="button" className="thanks-again" onClick={reset}>Lỡ tay? Vote lại</button>
          </div>
        ) : (
        <div className="order-card reveal in">
          <p className="step-title"><b>1.</b> Ai đang vote nè?</p>
          <div className="who-row">
            {ladies.map((l) => (
              <button key={l.id} type="button" className={`who ${who === l.id ? 'on' : ''}`}
                style={{ '--c': l.color }} onClick={() => setWho(l.id)} aria-pressed={who === l.id}>
                <img src={l.thumb} alt="" width="56" height="56" loading="lazy" />
                <span>{l.nickname}</span>
              </button>
            ))}
            <button type="button" className={`who who-other ${who === 'other' ? 'on' : ''}`}
              onClick={() => setWho('other')} aria-pressed={who === 'other'}>
              <span className="who-q">?</span>
              <span>Người khác</span>
            </button>
          </div>
          {who === 'other' && (
            <input className="text-in" placeholder="Tên bạn là gì nè?" value={otherName}
              onChange={(e) => setOtherName(e.target.value)} maxLength={40} />
          )}

          <p className="step-title"><b>2.</b> Vote quán nào đây?</p>
          <div className="drink-grid">
            {shops.map((sh) => (
              <button key={sh.id} type="button" className={`drink ${shopId === sh.id ? 'on' : ''}`}
                onClick={() => setShopId(sh.id)} aria-pressed={shopId === sh.id}>
                <Cup color={sh.color} size={52} />
                <span className="drink-name">{sh.name}</span>
                <span className="drink-desc">{sh.tag}</span>
              </button>
            ))}
            <button type="button" className={`drink ${shopId === 'other' ? 'on' : ''}`}
              onClick={() => setShopId('other')} aria-pressed={shopId === 'other'}>
              <Cup color="#ead0a6" size={52} />
              <span className="drink-name">Quán khác</span>
              <span className="drink-desc">Tự ghi tên quán</span>
            </button>
          </div>
          {shopId === 'other' && (
            <input className="text-in" placeholder="Tên quán là gì nè?" value={otherShop}
              onChange={(e) => setOtherShop(e.target.value)} maxLength={60} />
          )}

          {status === 'fallback' ? (
            <div className="order-done" role="status">
              <p>Chưa gửi tự động được 😢 Phiếu đã được copy, dán gửi tụi mình nhé:</p>
              <pre className="order-text">{message}</pre>
              <button type="button" className="btn-ghost" onClick={reset}>Làm lại</button>
            </div>
          ) : (
            <button type="button" className="btn-send" disabled={!ready || status === 'sending'} onClick={send}>
              {status === 'sending' ? 'Đang gửi…' : ready ? 'Gửi vote 💌' : 'Chọn tên & quán đã nha'}
            </button>
          )}
        </div>
        )}
      </div>
    </section>
  )
}
