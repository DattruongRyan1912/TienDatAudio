import ThemeDemo from '@/components/ThemeDemo'

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Theme Test Page
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Trang này để test xem theme có hoạt động không. 
            Thay đổi theme trong Admin → Giao diện rồi reload trang này để xem kết quả.
          </p>
          <ThemeDemo />
        </div>
      </div>
    </div>
  )
}
