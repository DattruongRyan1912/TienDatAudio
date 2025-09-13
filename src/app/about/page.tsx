import { generateSEOMetadata } from '@/lib/seo'

export const metadata = generateSEOMetadata({
  title: 'Về chúng tôi',
  description: 'Tìm hiểu về Tiến Đạt Audio - Đơn vị chuyên cung cấp thiết bị âm thanh chất lượng cao với hơn 10 năm kinh nghiệm'
})

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Về <span className="text-blue-600">Tiến Đạt Audio</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi là đơn vị hàng đầu trong lĩnh vực cung cấp thiết bị âm thanh chuyên nghiệp, 
            với hơn 10 năm kinh nghiệm phục vụ khách hàng trên toàn quốc.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Tiến Đạt Audio được thành lập với sứ mệnh mang đến những trải nghiệm âm thanh tuyệt vời 
                cho mọi khách hàng. Từ những ngày đầu khởi nghiệp với đội ngũ chỉ vài người, chúng tôi 
                đã không ngừng phát triển và trở thành một trong những thương hiệu uy tín nhất trong ngành.
              </p>
              <p>
                Chúng tôi hiểu rằng âm thanh không chỉ là âm nhạc, mà là cảm xúc, là trải nghiệm, 
                là khoảnh khắc đáng nhớ. Vì vậy, mỗi sản phẩm chúng tôi cung cấp đều được tuyển chọn 
                kỹ lưỡng từ những thương hiệu hàng đầu thế giới.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Tầm nhìn & Sứ mệnh</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🎯 Tầm nhìn</h4>
                <p className="text-blue-100">
                  Trở thành đơn vị số 1 Việt Nam trong lĩnh vực thiết bị âm thanh chuyên nghiệp
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎵 Sứ mệnh</h4>
                <p className="text-blue-100">
                  Mang đến trải nghiệm âm thanh hoàn hảo cho mọi không gian và mọi khách hàng
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💎 Giá trị cốt lõi</h4>
                <p className="text-blue-100">
                  Chất lượng - Uy tín - Chuyên nghiệp - Tận tâm
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chất lượng hàng đầu</h3>
            <p className="text-gray-600">
              Tất cả sản phẩm đều được nhập khẩu chính hãng từ các thương hiệu uy tín
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đội ngũ chuyên nghiệp</h3>
            <p className="text-gray-600">
              Kỹ thuật viên giàu kinh nghiệm, tư vấn tận tình và hỗ trợ 24/7
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🚚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dịch vụ toàn diện</h3>
            <p className="text-gray-600">
              Giao hàng nhanh, lắp đặt tận nơi, bảo hành chính hãng dài hạn
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Thành tựu của chúng tôi
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Khách hàng tin tưởng</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Năm kinh nghiệm</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Thương hiệu hợp tác</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-gray-600">Khách hàng hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
