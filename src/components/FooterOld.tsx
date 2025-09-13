import Link from "next/link"
import { Facebook, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react"

const categories = [
  { name: "Loa Bluetooth", href: "/san-pham?category=loa-bluetooth" },
  { name: "Amply Karaoke", href: "/san-pham?category=amply-karaoke" },
  { name: "Micro Không Dây", href: "/san-pham?category=micro-khong-day" },
  { name: "Thiết Bị DJ", href: "/san-pham?category=thiet-bi-dj" },
]

const quickLinks = [
  { name: "Về chúng tôi", href: "/gioi-thieu" },
  { name: "Chính sách bảo hành", href: "/chinh-sach-bao-hanh" },
  { name: "Hướng dẫn mua hàng", href: "/huong-dan-mua-hang" },
  { name: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-bold text-white mb-4">
              Tiến Đạt Audio
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Chuyên cung cấp thiết bị âm thanh chất lượng cao, phục vụ nhu cầu giải trí và kinh doanh.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>info@tiendataudio.com</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>8:00 - 22:00 (Thứ 2 - CN)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Danh mục sản phẩm
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Kết nối với chúng tôi
            </h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                Đăng ký nhận tin
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-r-md hover:bg-primary/90 transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Tiến Đạt Audio. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
