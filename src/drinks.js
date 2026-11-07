// Drink order settings — edit here, everything else updates automatically.
export const orderConfig = {
  // Link to the shop on ShopeeFood (open the shop in the app → Share → Copy link).
  // The QR code and the "Mở ShopeeFood" button both point here.
  shopeeUrl: 'https://shopeefood.vn/',

  // Orders are pushed to your phone through ntfy.sh (free, no sign-up):
  // install the "ntfy" app, tap + and subscribe to exactly this topic name.
  // Anyone who knows the name can read it, so keep it hard to guess.
  ntfyTopic: 'b4-women-tra-sua-7k2q9x',

  // Fallback if the push fails: the order is copied and this link is opened
  // so she can paste it to you. e.g. 'https://zalo.me/0912345678' or 'https://m.me/your.name'
  contactUrl: '',
}

// Match these to the shop's real menu. price is in thousand đồng (35 → 35k).
// color tints the little cup drawing.
export const drinks = [
  { id: 'ts-truyen-thong', name: 'Trà sữa truyền thống', desc: 'Trân châu đen dẻo dẻo', price: 35, color: '#c99a6b' },
  { id: 'ts-matcha', name: 'Trà sữa matcha', desc: 'Matcha Nhật, kem cheese', price: 42, color: '#9cc47a' },
  { id: 'ts-khoai-mon', name: 'Trà sữa khoai môn', desc: 'Tím mộng mơ', price: 40, color: '#b79ad6' },
  { id: 'tra-dao', name: 'Trà đào cam sả', desc: 'Thanh mát, nhiều đào', price: 39, color: '#f4a96a' },
  { id: 'tra-vai', name: 'Trà vải hoa hồng', desc: 'Ngọt nhẹ, thơm hoa', price: 39, color: '#f6b9c4' },
  { id: 'sua-tuoi-tcdd', name: 'Sữa tươi trân châu đường đen', desc: 'Best seller', price: 38, color: '#e9dcc8' },
  { id: 'hong-tra-kem', name: 'Hồng trà kem muối', desc: 'Béo béo mặn mặn', price: 36, color: '#d0745a' },
  { id: 'nuoc-ep', name: 'Nước ép dưa hấu', desc: 'Healthy chút nha', price: 35, color: '#f07a7a' },
]

export const sizes = [
  { id: 'M', label: 'Size M', extra: 0 },
  { id: 'L', label: 'Size L', extra: 6 },
]
export const sugarLevels = ['0%', '30%', '50%', '70%', '100%']
export const iceLevels = ['Không đá', 'Ít đá', 'Bình thường']
