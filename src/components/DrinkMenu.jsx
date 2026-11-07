import { useCallback, useEffect, useState } from 'react'
import { Blob, Heart, Sparkle } from './Doodles.jsx'
import { shops, sizes, sugarLevels, iceLevels, orderConfig } from '../drinks.js'

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

function Chips({ options, value, onChange, label }) {
  return (
    <div className="chip-row" role="radiogroup" aria-label={label}>
      <span className="chip-label">{label}</span>
      {options.map((o) => {
        const id = typeof o === 'string' ? o : o.id
        const text = typeof o === 'string' ? o : o.label
        return (
          <button key={id} type="button" role="radio" aria-checked={value === id}
            className={`chip ${value === id ? 'on' : ''}`} onClick={() => onChange(id)}>
            {text}
          </button>
        )
      })}
    </div>
  )
}

// Every order is also a vote for its shop. The votes live in the ntfy topic
// itself: the title is "🧋 <name> → <shop>", and we read them back from
// ntfy's message cache (ntfy.sh keeps messages for about 12 hours).
const TITLE_SEP = ' → '
const TOPIC_URL = `https://ntfy.sh/${encodeURIComponent(orderConfig.ntfyTopic)}`

function useVotes() {
  const [votes, setVotes] = useState([]) // [{ voter, shop, time }], latest per voter

  const refresh = useCallback(async () => {
    if (!orderConfig.ntfyTopic) return
    try {
      const res = await fetch(`${TOPIC_URL}/json?poll=1&since=all`)
      if (!res.ok) return
      const latest = new Map()
      for (const line of (await res.text()).split('\n')) {
        if (!line.trim()) continue
        const m = JSON.parse(line)
        const [voter, shop] = (m.title || '').replace(/^🧋\s*/, '').split(TITLE_SEP)
        if (m.event !== 'message' || !voter || !shop) continue
        latest.set(voter, { voter, shop, time: m.time }) // later messages overwrite: one vote each
      }
      setVotes([...latest.values()])
    } catch { /* keep showing the last tally */ }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 20000)
    return () => clearInterval(t)
  }, [refresh])

  return [votes, refresh]
}

// [{ shop, voters: [...] }] sorted by votes, most first
function tallyOf(votes) {
  const by = new Map()
  for (const v of votes) by.set(v.shop, [...(by.get(v.shop) || []), v.voter])
  return [...by].map(([shop, voters]) => ({ shop, voters })).sort((a, b) => b.voters.length - a.voters.length)
}

function VoteBoard({ votes, ladies }) {
  // notifications carry real names; the page shows nicknames
  const shown = (voter) => ladies.find((l) => l.realName === voter)?.nickname ?? voter
  const tally = tallyOf(votes.map((v) => ({ ...v, voter: shown(v.voter) })))
  const max = tally[0]?.voters.length || 1
  return (
    <div className="vote-card reveal">
      <p className="vote-title">Bảng vote</p>
      {tally.length === 0 ? (
        <p className="vote-hint">Chưa ai vote, mở hàng đi nào!</p>
      ) : (
        <ol className="vote-list">
          {tally.map((t, i) => (
            <li key={t.shop}>
              <div className="vote-head">
                <span>{i === 0 && t.voters.length > (tally[1]?.voters.length ?? 0) ? '👑 ' : ''}{t.shop}</span>
                <b>{t.voters.length}</b>
              </div>
              <div className="vote-bar"><span style={{ width: `${(t.voters.length / max) * 100}%` }} /></div>
              <p className="vote-who">{t.voters.join(', ')}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default function DrinkMenu({ ladies }) {
  const [votes, refreshVotes] = useVotes()
  const [who, setWho] = useState(null) // lady id, or 'other'
  const [otherName, setOtherName] = useState('')
  const [shopId, setShopId] = useState(null) // shop id, or 'other'
  const [otherShop, setOtherShop] = useState('')
  const [drinkIdx, setDrinkIdx] = useState(null) // index into the shop's menu
  const [typedDrink, setTypedDrink] = useState('')
  const [size, setSize] = useState('M')
  const [sugar, setSugar] = useState('50%')
  const [ice, setIce] = useState('Bình thường')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | fallback

  const lady = ladies.find((l) => l.id === who)
  const name = who === 'other' ? otherName.trim() : lady?.nickname
  const realName = who === 'other' ? name : lady?.realName || name // what the notification says
  const shop = shops.find((s) => s.id === shopId)
  const shopName = shopId === 'other' ? otherShop.trim() : shop?.name
  const menu = shop?.menu
  const picked = menu?.[drinkIdx]
  const drinkName = menu ? picked?.name : typedDrink.trim()
  const ready = Boolean(name && shopName && drinkName)

  const orderText = (by) => [
      `${by} order:`,
      `Quán: ${shopName}`,
      `${drinkName} (${size})${picked?.price ? ` ~${picked.price}k` : ''}`,
      `Đường ${sugar} · ${ice}`,
      note.trim() && `Ghi chú: ${note.trim()}`,
    ].filter(Boolean).join('\n')
  // the copy-and-paste fallback is shown on the page, so it keeps the nickname
  const message = ready ? orderText(name) : ''

  function pickShop(id) {
    setShopId(id)
    setDrinkIdx(null)
  }

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
      const others = votes.filter((v) => v.voter !== realName)
      const lead = tallyOf([...others, { voter: realName, shop: shopName }])
        .map((t) => `${t.shop} ${t.voters.length}`).join(' · ')
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
      refreshVotes()
    } catch {
      fallback()
    }
  }

  function reset() {
    setDrinkIdx(null)
    setTypedDrink('')
    setNote('')
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
        <div className="order-card reveal">
          <p className="step-title"><b>1.</b> Ai đang gọi món nè?</p>
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
                onClick={() => pickShop(sh.id)} aria-pressed={shopId === sh.id}>
                <Cup color={sh.color} size={52} />
                <span className="drink-name">{sh.name}</span>
                <span className="drink-desc">{sh.tag}</span>
              </button>
            ))}
            <button type="button" className={`drink ${shopId === 'other' ? 'on' : ''}`}
              onClick={() => pickShop('other')} aria-pressed={shopId === 'other'}>
              <Cup color="#ead0a6" size={52} />
              <span className="drink-name">Quán khác</span>
              <span className="drink-desc">Tự ghi tên quán</span>
            </button>
          </div>
          {shopId === 'other' && (
            <input className="text-in" placeholder="Tên quán là gì nè?" value={otherShop}
              onChange={(e) => setOtherShop(e.target.value)} maxLength={60} />
          )}

          {shopId && (
            <>
              <p className="step-title"><b>3.</b> Uống món gì?</p>
              {menu ? (
                <div className="drink-grid">
                  {menu.map((d, i) => (
                    <button key={d.name} type="button" className={`drink ${drinkIdx === i ? 'on' : ''}`}
                      onClick={() => setDrinkIdx(i)} aria-pressed={drinkIdx === i}>
                      <span className="drink-name">{d.name}</span>
                      {d.desc && <span className="drink-desc">{d.desc}</span>}
                      {d.price ? <span className="drink-price">{d.price}k</span> : null}
                    </button>
                  ))}
                </div>
              ) : (
                <input className="text-in" placeholder="Gõ tên món, vd: Ô Long Nhài Sữa" value={typedDrink}
                  onChange={(e) => setTypedDrink(e.target.value)} maxLength={80} />
              )}
            </>
          )}

          <p className="step-title"><b>{shopId ? 4 : 3}.</b> Tuỳ chỉnh xíu</p>
          <Chips label="Size" options={sizes} value={size} onChange={setSize} />
          <Chips label="Đường" options={sugarLevels} value={sugar} onChange={setSugar} />
          <Chips label="Đá" options={iceLevels} value={ice} onChange={setIce} />
          <textarea className="text-in" rows={2} placeholder="Thêm topping, ghi chú… (không bắt buộc)"
            value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />

          {status === 'sent' ? (
            <div className="order-done" role="status">
              <Sparkle size={30} />
              <p>Đã vote & gửi order! Xem bảng vote nha ♥</p>
              <button type="button" className="btn-ghost" onClick={reset}>Đổi món / đổi quán</button>
            </div>
          ) : status === 'fallback' ? (
            <div className="order-done" role="status">
              <p>Chưa gửi tự động được 😢 Đơn đã được copy, dán gửi tụi mình nhé:</p>
              <pre className="order-text">{message}</pre>
              <button type="button" className="btn-ghost" onClick={reset}>Làm lại</button>
            </div>
          ) : (
            <button type="button" className="btn-send" disabled={!ready || status === 'sending'} onClick={send}>
              {status === 'sending' ? 'Đang gửi…' : ready ? 'Gửi order 💌' : 'Chọn tên, quán & món đã nha'}
            </button>
          )}
        </div>

        <div className="side-col">
          <VoteBoard votes={votes} ladies={ladies} />
        </div>
      </div>
    </section>
  )
}
