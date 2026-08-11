# Editorial corpus audit

- Audited at: 2026-08-11T15:30:48.538Z
- Source: mongodb (127.0.0.1)
- Mode: read-only; no MongoDB document was changed.

## Current state

Corpus hiện có **100 bài editorial**. Trong đó 0 bài đang public đủ điều kiện, 0 bài còn draft, 100 bài đang chờ review và 100 bài đang noindex. Đây là trạng thái publish gate, chưa phải tín hiệu rằng nội dung đã sẵn sàng index.

| Hạng mục | Số lượng | Ý nghĩa |
| --- | ---: | --- |
| Bài public đủ điều kiện | 0 | Được phép đưa vào public discovery nếu không có gate khác |
| Draft | 0 | Chưa được publish |
| Review | 100 | Đã qua bước chuẩn bị nhưng còn human gate |
| Noindex | 100 | Chưa cho công cụ tìm kiếm lập chỉ mục |
| Thiếu reviewer | 100 | Cần người kiểm duyệt trước khi public |
| Cần ảnh thật/được cấp phép | 100 | Không dùng ảnh tạm hoặc placeholder khi publish |
| Không có gallery | 100 | Chỉ là cảnh báo; không phải bài nào cũng cần gallery |
| Không có nguồn ngoài | 0 | Cần research hoặc đánh dấu NEEDS_VERIFICATION |
| Không có internal link | 0 | Có nguy cơ orphan hoặc thiếu topical graph |
| Không có product relation | 96 | Cần xác nhận có nên nối sản phẩm thật hay không |
| Cặp có nguy cơ cannibalization | 46 | Heuristic token overlap; bắt buộc review SERP trước merge/canonical |

## Batch 1 đề xuất (8 bài)

Đây là batch nghiên cứu và biên tập đầu tiên. Các bài vẫn chưa được publish tự động. Mỗi bài cần đối chiếu SERP hiện tại, nguồn kỹ thuật chính thống, internal links thật và image plan trước khi chuyển review.

| # | Slug | Cluster | Intent | Vai trò | Điểm ưu tiên |
| ---: | --- | --- | --- | --- | ---: |
| 1 | `lap-dat-dan-karaoke-gia-dinh-quang-ngai` | core-local | local | Setup Guide / How-to | 9 |
| 2 | `mua-loa-karaoke-o-quang-ngai` | local-quang-ngai | local | Commercial Investigation / Project Guide | 9 |
| 3 | `cach-chon-loa-nghe-nhac-bolero` | speaker-hi-fi | commercial | Buying Guide | 8 |
| 4 | `dan-karaoke-gia-dinh-cho-phong-khach-mo` | family-karaoke | commercial | Acoustic / Placement | 8 |
| 5 | `micro-phat-bieu-khong-day-cho-hoi-nghi` | commercial-event | commercial | Commercial Investigation / Project Guide | 8 |
| 6 | `thiet-ke-am-thanh-phong-hop` | commercial-event | commercial | Commercial Investigation / Project Guide | 8 |
| 7 | `thiet-ke-am-thanh-quan-cafe-nho` | commercial-event | commercial | Acoustic / Placement | 8 |
| 8 | `thiet-ke-phong-nghe-nhac-tai-nha` | room-acoustics | commercial | Acoustic / Placement | 8 |

## Publish gates chưa đạt

- `NEEDS_VERIFICATION`: không đưa claim kỹ thuật, thông số, giá, tồn kho, case hoặc trải nghiệm thực tế lên public nếu chưa có nguồn hoặc xác nhận nội bộ.
- `IMAGE_REQUIRED`: thay ảnh tạm bằng asset sở hữu/được cấp phép/original hoặc sơ đồ minh họa có nhãn rõ ràng.
- `REAL_EXPERIENCE_REQUIRED`: không biến template seed thành case study hoặc trải nghiệm của Tiến Đạt Audio khi chưa có dữ liệu thật.
- Human gate: reviewer, canonical/meta, FAQ thật, schema đúng nội dung, internal-link graph và browser/mobile QA.

## Files output

- `content-inventory.json`: inventory từng bài, SEO fields, source/image/link gaps và heuristic cannibalization pairs.
- `topic-clusters.json`: cluster map, pillar/supporting candidates và batch đề xuất.
- `cannibalization-report.md`: nhóm cần review, cách xử lý và nguyên tắc không merge tự động.

## Next action

Research batch 1 theo thứ tự: audit query intent → đọc nguồn primary → viết lại từng bài → map internal links tới nội dung/sản phẩm thật → image QA → fact check → chuyển review. Chỉ sau khi reviewer duyệt mới bật public/index cho batch đó.
