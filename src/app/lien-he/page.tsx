import { MapPin, Phone, Mail, Clock } from "lucide-react"
import ContactForm from "@/components/ContactForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Liên hệ - Tiến Đạt Audio",
  description: "Liên hệ với Tiến Đạt Audio để được tư vấn và hỗ trợ về thiết bị âm thanh",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn và hỗ trợ bạn tìm kiếm thiết bị âm thanh phù hợp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Thông Tin Liên Hệ
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ cửa hàng</h3>
                  <p className="text-gray-600">
                    123 Đường ABC, Phường XYZ<br />
                    Quận 1, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Số điện thoại</h3>
                  <p className="text-gray-600">
                    Hotline: <a href="tel:0123456789" className="text-primary hover:underline">0123 456 789</a><br />
                    Zalo: <a href="tel:0987654321" className="text-primary hover:underline">0987 654 321</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:info@tiendataudio.com" className="text-primary hover:underline">
                      info@tiendataudio.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Giờ mở cửa</h3>
                  <div className="text-gray-600">
                    <p>Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
                    <p>Hỗ trợ trực tuyến 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Bản đồ</h3>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Google Maps sẽ được tích hợp tại đây</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Gửi Tin Nhắn
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Vì Sao Chọn Tiến Đạt Audio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tư Vấn Chuyên Nghiệp</h3>
              <p className="text-gray-600">
                Đội ngũ chuyên gia với nhiều năm kinh nghiệm trong lĩnh vực âm thanh
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Showroom Chính Hãng</h3>
              <p className="text-gray-600">
                Không gian trưng bày rộng rãi để khách hàng trải nghiệm sản phẩm
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hỗ Trợ 24/7</h3>
              <p className="text-gray-600">
                Sẵn sàng hỗ trợ khách hàng mọi lúc, mọi nơi qua nhiều kênh liên lạc
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
