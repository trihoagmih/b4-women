// Drink order settings — edit here, everything else updates automatically.
export const orderConfig = {
  // Orders are pushed to your phone through ntfy.sh (free, no sign-up):
  // install the "ntfy" app, tap + and subscribe to exactly this topic name.
  // Anyone who knows the name can read it, so keep it hard to guess.
  ntfyTopic: 'b4-women-tra-sua-7k2q9x',

  // Fallback if the push fails: the order is copied and this link is opened
  // so she can paste it to you. e.g. 'https://zalo.me/0912345678' or 'https://m.me/your.name'
  contactUrl: '',
}

// The milk-tea shops the girls can pick from.
// - color tints the shop's little cup.
export const shops = [
  { id: 'laang-traa', name: 'Laang Traa', tag: 'Một ly là vui', color: '#9cc47a' },
  { id: 'nooshan', name: 'Nooshan', tag: 'Chill chút nha', color: '#e27aa0' },
  { id: 'zang-tea', name: 'Zang Tea', tag: 'Uống là mê', color: '#f2b77a' },
  { id: 'mam', name: 'Mầm', tag: 'Xanh mát dịu dàng', color: '#7fb98a' },
  { id: 'phela', name: 'Phê La', tag: 'Ô long đặc sản', color: '#b5835a' },
]

export const sizes = [
  { id: 'M', label: 'Size M' },
  { id: 'L', label: 'Size L' },
]
export const sugarLevels = ['0%', '30%', '50%', '70%', '100%']
export const iceLevels = ['Không đá', 'Ít đá', 'Bình thường']
