'use client'

import { useState } from 'react'
import { Calculator, CheckCircle2, MessageCircle, Phone } from 'lucide-react'

export default function HomeKaraokeCalculator() {
  const [room, setRoom] = useState<'small' | 'medium' | 'large'>('medium')
  const [budget, setBudget] = useState<'eco' | 'mid' | 'vip'>('mid')
  const [genre, setGenre] = useState<'family' | 'remix' | 'all'>('family')

  function getRecommendation() {
    if (room === 'small' || budget === 'eco') {
      return {
        title: 'Combo Karaoke Gia Đình Nhỏ Eco-01 (Dưới 20 triệu)',
        price: 'Khoảng 14.800.000đ - 18.000.000đ',
        specs: [
          '01 Cặp loa nằm/loa full Bass 25cm (chất âm ấm áp, rõ lời)',
          '01 Amply liền vang số 3 trong 1 tích hợp bộ thu micro',
          '02 Tay micro không dây UHF chống hú tự động',
          'Miễn phí 10m dây loa đồng OFC + jack kết nối',
        ],
        advice: 'Cấu hình tiết kiệm diện tích, cực kỳ dễ sử dụng cho phòng khách nhỏ hoặc căn hộ chung cư dưới 20m².',
      }
    }

    if (budget === 'vip' || room === 'large') {
      return {
        title: 'Dàn Karaoke Biệt Thự & Phòng Khách Lớn Pro-08 (Cao Cấp)',
        price: 'Khoảng 52.000.000đ - 65.000.000đ',
        specs: [
          '02 Cặp loa Full Bass 30cm củ Neodymium uy lực',
          '01 Cục đẩy công suất 4 kênh chuyên dụng 4x800W',
          '01 Vang số DSP cao cấp chip vi xử lý 32-bit',
          '01 Loa Subwoofer điện/hơi Bass 40cm đánh rung sàn',
          '01 Bộ quản lý nguồn điện tự động 8 cổng chống chập nổ',
        ],
        advice: 'Âm thanh bao phủ toàn bộ không gian phòng khách mở trên 35m², độ động cực lớn, hát lực như sân khấu lớn.',
      }
    }

    // Default medium
    return {
      title: 'Combo Tiêu Chuẩn Bán Chạy TĐ-01 (Phòng 20 - 35m²)',
      price: 'Khoảng 28.900.000đ - 36.000.000đ',
      specs: [
        '01 Cặp loa Full Bass 30cm (công suất 350W RMS)',
        '01 Cục đẩy công suất 2 kênh 800W/kênh khỏe khoắn',
        '01 Vang số DSP chuyên nghiệp cắt sạch 100% tiếng rít',
        '01 Bộ micro không dây UHF cao cấp bắt sóng xa 50m',
        'Tặng 20m dây loa đồng OFC + 2 chống lăn micro',
      ],
      advice: 'Cấu hình "tỷ lệ vàng" bán chạy nhất cho phòng khách nhà ống tại Quảng Ngãi: hát nhẹ hơi, không lo dội âm.',
    }
  }

  const rec = getRecommendation()
  const zaloMessage = encodeURIComponent(
    `Xin chào Tiến Đạt Audio! Tôi vừa dùng công cụ dự toán trên web và quan tâm đến cấu hình: ${rec.title} (Ngân sách: ${rec.price}, Phòng: ${room === 'small' ? '<20m2' : room === 'medium' ? '20-35m2' : '>35m2'}). Nhờ showroom tư vấn chi tiết giúp tôi.`
  )

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--sonic-line-strong)] bg-gradient-to-br from-[var(--sonic-surface-strong)] via-[var(--sonic-surface)] to-[var(--sonic-surface-strong)] p-6 md:p-10 shadow-xl">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold)]/10 px-3 py-1 text-xs font-bold text-[var(--sonic-gold)] uppercase tracking-wider">
          <Calculator size={14} /> Công cụ tính toán nhanh
        </span>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-[var(--sonic-text-strong)] md:text-3xl">
          Dự Toán Dàn Karaoke Gia Đình (Trong 10 Giây)
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--sonic-muted)]">
          Chọn diện tích phòng khách và mức đầu tư dự kiến để nhận cấu hình chuẩn âm học tối ưu chi phí nhất.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {/* Step 1 */}
        <div className="rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">
            1. Diện tích phòng khách
          </label>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value as 'small' | 'medium' | 'large')}
            className="mt-2 w-full rounded-lg border border-[var(--sonic-line-strong)] bg-[var(--sonic-surface-strong)] px-3 py-2.5 text-sm font-semibold text-[var(--sonic-text-strong)] outline-none transition-colors focus:border-[var(--sonic-gold)]"
          >
            <option value="small">Dưới 20m² (Phòng nhỏ / Chung cư)</option>
            <option value="medium">20m² - 35m² (Nhà ống phổ biến)</option>
            <option value="large">Trên 35m² (Phòng lớn / Biệt thự)</option>
          </select>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">
            2. Ngân sách dự kiến
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value as 'eco' | 'mid' | 'vip')}
            className="mt-2 w-full rounded-lg border border-[var(--sonic-line-strong)] bg-[var(--sonic-surface-strong)] px-3 py-2.5 text-sm font-semibold text-[var(--sonic-text-strong)] outline-none transition-colors focus:border-[var(--sonic-gold)]"
          >
            <option value="eco">Dưới 20 triệu (Tiết kiệm, đủ dùng)</option>
            <option value="mid">25 - 40 triệu (Bán chạy, hát hay)</option>
            <option value="vip">Trên 45 triệu (Cao cấp, chuyên nghiệp)</option>
          </select>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)]">
            3. Gu âm nhạc chính
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as 'family' | 'remix' | 'all')}
            className="mt-2 w-full rounded-lg border border-[var(--sonic-line-strong)] bg-[var(--sonic-surface-strong)] px-3 py-2.5 text-sm font-semibold text-[var(--sonic-text-strong)] outline-none transition-colors focus:border-[var(--sonic-gold)]"
          >
            <option value="family">Hát karaoke gia đình, Bolero nhẹ nhàng</option>
            <option value="remix">Nhạc Remix, Dance sôi động (Cần Bass mạnh)</option>
            <option value="all">Đa năng (Nghe nhạc vàng + Hát cuối tuần)</option>
          </select>
        </div>
      </div>

      {/* Result Card */}
      <div className="mt-6 rounded-xl border-2 border-[var(--sonic-gold)]/60 bg-[var(--sonic-surface-strong)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--sonic-gold)]">
              Gợi ý cấu hình phù hợp nhất:
            </span>
            <h4 className="mt-1 text-xl font-black text-[var(--sonic-text-strong)] md:text-2xl">
              {rec.title}
            </h4>
            <p className="mt-1 text-lg font-extrabold text-[var(--sonic-gold)]">
              {rec.price}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href="tel:0934995657"
              className="inline-flex items-center gap-2 rounded-lg bg-[#d32f2f] px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#b71c1c]"
            >
              <Phone size={14} /> Gọi tư vấn ngay
            </a>
            <a
              href={`https://zalo.me/0934995657?text=${zaloMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0068ff] px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#0052cc]"
            >
              <MessageCircle size={14} /> Nhận báo giá qua Zalo
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-2 border-t border-[var(--sonic-line)] pt-4 sm:grid-cols-2">
          {rec.specs.map((spec, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--sonic-text)]">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--sonic-gold)]" />
              <span>{spec}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-[var(--sonic-surface)] p-3 text-xs italic text-[var(--sonic-muted)]">
          💡 <strong>Lời khuyên từ kỹ thuật viên:</strong> {rec.advice}
        </p>
      </div>
    </div>
  )
}
