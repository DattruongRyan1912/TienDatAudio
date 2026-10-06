Vang số (Digital Echo/Reverb Processor) là trung tâm điều khiển âm thanh quan trọng nhất trong một bộ [dàn karaoke gia đình](/kien-thuc/dan-karaoke-gia-dinh-gia-bao-nhieu) hiện đại. Khác với amply cơ truyền thống chỉ cho phép can thiệp vào 3 núm vặn Bass - Mid - Treble một cách thô sơ, vang số sử dụng bộ xử lý tín hiệu số DSP đa nhân (Digital Signal Processor), cho phép bạn can thiệp chính xác vào từng dải tần số đơn lẻ ($20\text{Hz} - 20.000\text{Hz}$) thông qua phần mềm chuyên dụng trên máy tính.

Tuy nhiên, rất nhiều người dùng sau khi mua vang số về lại gặp tình trạng giọng hát bị khô, nặng tiếng, hoặc loa vẫn bị hú rít xé tai khi mở âm lượng lớn. Nguyên nhân chủ yếu là do người dùng chưa nắm được quy trình căn chỉnh các dải EQ và chưa làm chủ được thuật toán cắt hú rít (Feedback Eliminator). Bài viết này được đội ngũ kỹ sư âm thanh của [Tiến Đạt Audio](/contact) tổng hợp từ kinh nghiệm căn chỉnh hàng trăm bộ dàn thực tế tại Quảng Ngãi, hướng dẫn bạn từng bước làm chủ phần mềm vang số để có giọng hát bay bổng và triệt tiêu hú rít 100%.

## 1. Chuẩn bị kết nối máy tính và vang số

Trước khi tiến hành căn chỉnh phần mềm, bạn cần thiết lập kết nối an toàn giữa máy tính và thiết bị:

- **Dây cáp kết nối:** Sử dụng dây cáp USB chuẩn Type-A sang Type-B (loại cổng vuông thường dùng cho máy in) hoặc cáp RS-232 chuyên dụng đi kèm với vang số.
- **Cài đặt Driver và Phần mềm:** Tải đúng phiên bản phần mềm điều khiển tương ứng với model vang số bạn đang sử dụng (ví dụ: ARF VX-330Pro, X5, X6, BKSound, JBL KX180...). Cài đặt driver cổng COM (thường là driver CH340 hoặc FTDI).
- **Quy tắc an toàn bật thiết bị:** Tắt hoàn toàn [cục đẩy công suất](/products?category=cuc-day) trước khi cắm cáp kết nối. Sau khi máy tính nhận cổng COM và phần mềm báo trạng thái **"Connected"** hoặc **"Link Success"**, bạn mới bật cục đẩy ở mức âm lượng nhỏ nhất để test tiếng.

## 2. Bảng phân vùng dải tần số trên Micro và kỹ thuật cắt hú PEQ

Trong phần mềm vang số, tab **MIC** là khu vực quan trọng nhất quyết định chất lượng giọng hát và độ ổn định của hệ thống. Dưới đây là bảng phân vùng tần số chuẩn âm học và giải pháp xử lý kỹ thuật:

| Dải tần số | Tên gọi chuyên môn | Ảnh hưởng tới giọng hát | Kỹ thuật xử lý trên phần mềm vang số |
| :--- | :--- | :--- | :--- |
| **Dưới $80\text{Hz}$** | Tần số siêu trầm (Sub-bass) | Tạo tiếng gió thổi vào đầu mic, tiếng lộp cộp khi cầm tay | **Bật bộ lọc HPF (High-Pass Filter):** Cắt triệt để toàn bộ tần số dưới $80\text{Hz} - 110\text{Hz}$ (độ dốc $24\text{dB/Octave}$, chuẩn Butterworth hoặc Linkwitz-Riley). |
| **$120\text{Hz} - 250\text{Hz}$** | Dải trầm giọng hát (Low Warmth) | Tạo độ ấm và độ dày cho giọng nam trầm | Giữ mức $0\text{dB}$, nếu phòng nhiều tiếng vang thì gọt nhẹ $-1.5\text{dB}$ tại điểm $160\text{Hz}$ để tránh ù tiếng. |
| **$400\text{Hz} - 800\text{Hz}$** | Dải trung trầm (Lower Midrange) | Giọng hát bị đục, bí tiếng như hát trong thùng giấy | Dùng Parametric EQ (PEQ) gọt nhẹ $-2\text{dB}$ tại dải $500\text{Hz} - 630\text{Hz}$ để làm sạch giọng hát. |
| **$1.000\text{Hz} - 3.500\text{Hz}$** | Dải trung cao (Upper Midrange) | Độ rõ lời và phát âm nguyên âm (a, e, i, o, u) | Giữ phẳng ($0\text{dB}$), tránh tăng quá mức vì dải này rất dễ gây hú trung ("ô ô", "u u"). |
| **$4.000\text{Hz} - 8.000\text{Hz}$** | Dải cao và Treble kèn | Độ bay bổng, sáng tiếng, tiếng xì xào của phụ âm | Khu vực xuất hiện tiếng rít xé tai. Cần dùng Notch Filter cắt sâu $-4\text{dB}$ đến $-6\text{dB}$ tại đúng điểm cộng hưởng. |
| **Trên $12.000\text{Hz}$** | Dải siêu cao (Air Band) | Độ tơi xốp của hiệu ứng Reverb | Dùng High-Shelf nâng nhẹ $+1.5\text{dB}$ nếu dùng micro cao cấp để tạo độ bay. |

## 3. Quy trình 4 bước cắt hú rít triệt để bằng Notch Filter

Để cắt hú mà không làm hỏng chất âm của micro, bạn tuyệt đối không được vặn giảm toàn bộ thanh Treble trên EQ. Hãy áp dụng quy trình "bắt và gọt điểm hú" chuyên nghiệp:

1. **Bước 1 — Bật tính năng chống hú tự động (FBE/Anti-Feedback):** Trong phần mềm, tìm mục **Feedback** và chọn mức độ 1 hoặc 2. Tránh đặt ở mức cao nhất (mức 3 hoặc 4) vì thuật toán quét pha sẽ làm giọng hát bị bóp méo, mất độ tự nhiên.
2. **Bước 2 — Đo quét tìm điểm cộng hưởng (Feedback Sweep):** Đứng tại vị trí hát thường xuyên, hướng micro nhẹ về phía loa và tăng dần Gain tổng của Micro cho đến khi bắt đầu nghe thấy tiếng rít nhẹ xuất hiện.
3. **Bước 3 — Tạo bộ lọc Notch Filter hẹp:** Trên dải EQ của Micro, chọn một cần gạt (Band PEQ) tại khu vực tần số đang hú (ví dụ $4.500\text{Hz}$). Nâng giá trị hệ số chất lượng **$Q$** lên mức $8.0 - 12.0$ (thu hẹp độ rộng dải tần để chỉ tác động vào đúng nốt nhạc đang bị hú rít).
4. **Bước 4 — Gọt biên độ âm:** Kéo Gain của cần gạt này xuống mức $-4\text{dB}$ đến $-7\text{dB}$. Ngay lập tức tiếng rít sẽ biến mất hoàn toàn trong khi toàn bộ dải âm sắc xung quanh của giọng hát vẫn được giữ nguyên vẹn. Chi tiết về cơ chế này bạn có thể đọc thêm tại bài phân tích [loa karaoke bị hú: nguyên nhân và cách khắc phục](/kien-thuc/loa-karaoke-bi-hu-nguyen-nhan-cach-khac-phuc).

## 4. Công thức căn chỉnh hiệu ứng Echo và Reverb trợ giọng

Hiệu ứng vang vọng (Effect) quyết định tới 60% cảm xúc khi hát karaoke. Nếu căn chỉnh quá nhiều Echo, tiếng hát sẽ bị rối và đè lên lời nhạc; nếu chỉ dùng Reverb thuần túy như sân khấu chuyên nghiệp, người không rành kỹ thuật sẽ cảm thấy hát rất tốn hơi và mệt. Cấu hình lý tưởng cho phòng khách gia đình là sự phối hợp hài hòa giữa Echo và Reverb:

### Thông số Echo chuẩn phòng khách
- **Echo Level:** $100\%$ (Mức tín hiệu Echo xuất ra).
- **Direct Sound:** $95\% - 100\%$ (Tiếng mộc của giọng hát trực tiếp).
- **Echo Delay:** $220\text{ms} - 240\text{ms}$ (Khoảng thời gian trễ giữa các lần lặp, phù hợp với nhịp thở của người Việt Nam).
- **Echo Repeat (Feedback):** $52\% - 58\%$ (Số lần lặp lại tiếng hát, thường từ 5 đến 6 lần lặp là vừa đẹp).
- **Echo HPF / LPF:** Cắt dải dưới $110\text{Hz}$ và cắt dải trên $10.500\text{Hz}$ để âm sắc lặp lại không bị đục hoặc xé tiếng.

### Thông số Reverb trợ giọng tự nhiên
- **Reverb Level:** $45\% - 55\%$ (Mức âm lượng Reverb so với Echo).
- **Reverb Time (Decay Time):** $2.6\text{s} - 3.2\text{s}$ (Thời gian tiêu tán đuôi âm vang trong không gian phòng).
- **Pre-Delay:** $20\text{ms} - 35\text{ms}$ (Khoảng cách trễ trước khi tiếng vang phòng xuất hiện, giúp phát âm từ đầu tiên rõ ràng, không bị dính chữ).

## 5. Lưu trữ và xuất cấu hình Preset an toàn

Sau khi đã hoàn thiện các bước nghe thử và tinh chỉnh với nhạc nền, bạn cần lưu trữ cấu hình:

- Nhấn vào nút **Save to Device** trên phần mềm để ghi cấu hình vào bộ nhớ Flash của vang số (thường lưu vào User Mode 1 hoặc Mode Hát Gia Đình).
- Nhấn **Save to PC** để xuất ra một file backup có đuôi `.dat` hoặc `.xml` lưu trữ trong máy tính. Trong trường hợp có người khác vô tình bấm nhầm các phím trên mặt máy làm sai lệch cài đặt, bạn chỉ mất 10 giây để nạp lại cấu hình chuẩn ban đầu.

Nếu bạn đang gặp khó khăn trong việc kết nối phần mềm hoặc cần hỗ trợ đo đạc RTA bằng micro chuyên dụng tại TP Quảng Ngãi, Bình Sơn, Tư Nghĩa, Mộ Đức, hãy liên hệ ngay với [Tiến Đạt Audio](/contact) qua hotline **0934 995 657** để được kỹ thuật viên hỗ trợ căn chỉnh tận nơi.
