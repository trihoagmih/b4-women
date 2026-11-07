import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Blob, Heart, Sparkle } from './Doodles.jsx'
import { drinks, sizes, sugarLevels, iceLevels, orderConfig } from '../drinks.js'

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

function ShopeeQR() {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    QRCode.toString(orderConfig.shopeeUrl, { type: 'svg', margin: 1, color: { dark: INK, light: '#fffaf3' } })
      .then(setSvg)
      .catch(() => setSvg(''))
  }, [])
  return (
    <div className="qr-card reveal">
      <p className="qr-title">Tự đặt trên ShopeeFood</p>
      {svg && <div className="qr-img" dangerouslySetInnerHTML={{ __html: svg }} />}
      <p className="qr-hint">Quét mã hoặc bấm nút nha</p>
      <a className="btn-ghost" href={orderConfig.shopeeUrl} target="_blank" rel="noreferrer">Mở ShopeeFood</a>
    </div>
  )
}

export default function DrinkMenu({ ladies }) {
  const [who, setWho] = useState(null) // lady id, or 'other'
  const [otherName, setOtherName] = useState('')
  const [drinkId, setDrinkId] = useState(null)
  const [size, setSize] = useState('M')
  const [sugar, setSugar] = useState('50%')
  const [ice, setIce] = useState('Bình thường')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | fallback

  const drink = drinks.find((d) => d.id === drinkId)
  const lady = ladies.find((l) => l.id === who)
  const name = who === 'other' ? otherName.trim() : lady?.nickname
  const price = drink ? drink.price + (sizes.find((s) => s.id === size)?.extra ?? 0) : 0
  const ready = Boolean(drink && name)

  const message = useMemo(() => {
    if (!ready) return ''
    return [
      `${name} order:`,
      `${drink.name} (${size}) ~${price}k`,
      `Đường ${sugar} · ${ice}`,
      note.trim() && `Ghi chú: ${note.trim()}`,
    ].filter(Boolean).join('\n')
  }, [ready, name, drink, size, price, sugar, ice, note])

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
      const res = await fetch('https://ntfy.sh/', {
        method: 'POST',
        body: JSON.stringify({
          topic: orderConfig.ntfyTopic,
          title: `🧋 ${name} gọi nước`,
          message,
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
    setDrinkId(null)
    setNote('')
    setStatus('idle')
  }

  return (
    <section id="drinks" className="drinks">
      <h2 className="section-title reveal">
        <Blob color="#ffd97a" />
        <span>Trà sữa đâu?</span>
      </h2>
      <p className="section-sub reveal">
        Chọn món đi mấy bà, B4 bao hết <Heart size={22} />
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

          <p className="step-title"><b>2.</b> Uống gì đây?</p>
          <div className="drink-grid">
            {drinks.map((d) => (
              <button key={d.id} type="button" className={`drink ${drinkId === d.id ? 'on' : ''}`}
                onClick={() => setDrinkId(d.id)} aria-pressed={drinkId === d.id}>
                <Cup color={d.color} size={52} />
                <span className="drink-name">{d.name}</span>
                <span className="drink-desc">{d.desc}</span>
                <span className="drink-price">{d.price}k</span>
              </button>
            ))}
          </div>

          <p className="step-title"><b>3.</b> Tuỳ chỉnh xíu</p>
          <Chips label="Size" options={sizes} value={size} onChange={setSize} />
          <Chips label="Đường" options={sugarLevels} value={sugar} onChange={setSugar} />
          <Chips label="Đá" options={iceLevels} value={ice} onChange={setIce} />
          <textarea className="text-in" rows={2} placeholder="Thêm topping, ghi chú… (không bắt buộc)"
            value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />

          {status === 'sent' ? (
            <div className="order-done" role="status">
              <Sparkle size={30} />
              <p>Đã gửi! Nước đang trên đường tới nha ♥</p>
              <button type="button" className="btn-ghost" onClick={reset}>Gọi thêm món</button>
            </div>
          ) : status === 'fallback' ? (
            <div className="order-done" role="status">
              <p>Chưa gửi tự động được 😢 Đơn đã được copy, dán gửi tụi mình nhé:</p>
              <pre className="order-text">{message}</pre>
              <button type="button" className="btn-ghost" onClick={reset}>Làm lại</button>
            </div>
          ) : (
            <button type="button" className="btn-send" disabled={!ready || status === 'sending'} onClick={send}>
              {status === 'sending' ? 'Đang gửi…' : ready ? `Gửi order · ${price}k` : 'Chọn tên & món đã nha'}
            </button>
          )}
        </div>

        <ShopeeQR />
      </div>
    </section>
  )
}
