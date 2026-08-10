# Tiến Đạt Audio Facebook Import Bridge

Chrome Extension MV3 này cho phép trang Social Post admin trên production dùng đúng phiên Facebook đang đăng nhập trong Chrome để quét gallery. Extension chỉ trả URL ảnh và metadata về đúng tab admin đã gọi; cookie, token và profile Chrome không được đọc hoặc gửi lên server.

## Cài local

1. Mở `chrome://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `extensions/facebook-import-bridge` trong repository.
5. Reload trang `/admin/social-posts/new`; trạng thái phải chuyển thành **Chrome Bridge đã kết nối**.

## Sử dụng

1. Đăng nhập Facebook trong cùng Chrome profile.
2. Dán permalink bài Facebook và bấm **Lấy preview**.
3. Bấm **Chrome session · quét full gallery**.
4. Extension mở một tab Facebook, quét ảnh rồi đóng đúng tab vừa tạo.
5. Chọn ảnh và bấm **Lưu ảnh & chuyển Native**; tab admin sẽ gọi API production để lưu Cloudinary/MongoDB.

## Boundary bảo mật

- Không yêu cầu quyền `cookies`, `debugger` hoặc quyền đọc toàn bộ lịch sử.
- Chỉ chạy trên hai admin origin được allowlist và các trang Facebook.
- Không gửi admin cookie cho extension; tab admin tự gọi API bằng session hiện tại.
- Không tự publish. Admin vẫn phải kiểm tra, lưu và xuất bản theo workflow hiện có.
