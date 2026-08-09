# Tiến Đạt Audio — Project instructions

Các quy tắc này áp dụng cho mọi agent làm việc trong repository. Mục tiêu là thay đổi nhỏ, có thể kiểm chứng, có đường lui và để lại bằng chứng vận hành; không yêu cầu hiển thị chain-of-thought.

## Project baseline

- Stack: Next.js 15 App Router, React 19, TypeScript, MongoDB, Cloudinary, Nginx và systemd.
- Application code nằm trong `src/`; production automation nằm trong `deploy/`; GitHub Actions nằm trong `.github/workflows/`.
- Dùng lại repository/auth/validation pattern hiện có. Admin mutation phải qua guard hiện hành; không tạo nguồn dữ liệu production thứ hai khi MongoDB đã sở hữu domain đó.
- Lệnh kiểm tra chuẩn: `npm run lint`, `npm run build`, `npm audit --omit=dev --audit-level=high` và `bash deploy/scripts/audit-secrets.sh` tùy phạm vi.

## 1. Audit trước khi thay đổi

- Đọc yêu cầu, xác định phạm vi được phép và hỏi lại khi một lựa chọn chưa rõ có thể làm thay đổi kết quả.
- Kiểm tra `git status`, branch, remote, file liên quan, dependency/runtime và trạng thái dịch vụ trước khi sửa.
- Giữ nguyên mọi thay đổi chưa commit của người dùng. Không ghi đè, reset hoặc xóa phần ngoài phạm vi.
- Ghi baseline, rủi ro và giả định đã được xác minh vào mục mới trong `.agent/WORKLOG.md` đối với công việc có ảnh hưởng đáng kể.

## 2. Plan có tiêu chí hoàn thành

- Với task nhiều bước, lập plan ngắn gồm: mục tiêu, phạm vi file/hệ thống, acceptance checks, rủi ro, rollback và human gate.
- Chỉ có một bước ở trạng thái đang thực hiện. Cập nhật plan khi bằng chứng mới làm thay đổi hướng đi.
- Không triển khai nếu thiếu secret, quyền truy cập hoặc quyết định có thể làm thay đổi dữ liệu/sản phẩm; báo rõ blocker thay vì phỏng đoán.
- Roadmap module dài hạn được lưu tại `.agent/IMPLEMENTATION_PLAN.md`; cập nhật file này khi phạm vi hoặc thứ tự ưu tiên thay đổi đáng kể.

## 3. Thực thi an toàn

- Ưu tiên patch nhỏ, ít code, dùng lại pattern hiện có và hành động có thể đảo ngược.
- Secret chỉ tồn tại trong secret store hoặc file môi trường ngoài repository. Không in secret ra log, command output, commit, artifact hay deployment receipt.
- Không chạy thao tác phá hủy diện rộng. Với xóa dữ liệu, migration không tương thích ngược, thay DNS, firewall, credential hoặc quyền truy cập lâu dài: phải xác minh đích và có human gate phù hợp.
- Deployment phải dùng release directory bất biến và chuyển symlink atomically; không sửa trực tiếp production working tree.

## 4. Verify độc lập với thao tác sửa

Tùy phạm vi, chạy tối thiểu các kiểm tra phù hợp sau:

1. lint/type/build hoặc test tập trung;
2. secret scan và dependency audit;
3. smoke test endpoint/UI đã thay đổi;
4. production health check qua origin và domain;
5. kiểm tra service, TLS, firewall, MongoDB bind/auth và log lỗi sau deploy.

Một thay đổi chỉ được xem là hoàn thành khi acceptance checks có bằng chứng. Thiếu bước verify bắt buộc phải fail closed, không báo thành công.

## 5. Append-only work log và receipt

- Sau mỗi công việc đáng kể, append một entry vào `.agent/WORKLOG.md`; không viết lại lịch sử. Nếu cần sửa, thêm correction entry mới.
- Entry gồm: thời gian, task, audit/baseline, plan, file/hệ thống đã đổi, kiểm tra và kết quả, rủi ro còn lại, rollback reference.
- Mỗi deployment phải append receipt JSONL trên server với release SHA, actor, thời gian, kết quả và previous release. Không chứa secret.
- Khi quay lại task bị gián đoạn, audit lại trạng thái hiện tại và đối chiếu entry gần nhất trước khi tiếp tục.

## 6. Quyền hạn và human gates

- Read-only audit trong phạm vi repository/VPS đã giao: được phép.
- Sửa code/config và chạy kiểm thử trong phạm vi task: được phép.
- Deploy lên môi trường mà người dùng đã chỉ định: chỉ thực hiện khi yêu cầu đã nêu rõ và preflight đạt.
- Tạo/đổi credential, mở rộng persistent access, xóa dữ liệu, migration không thể rollback, thay DNS/Cloudflare hoặc khóa SSH hiện tại: dừng tại action boundary và xin xác nhận nếu chưa được xác nhận cụ thể.

Repo skill nằm tại `.agents/skills/tiendataudio-project/`; custom agent nằm tại `.codex/agents/tiendataudio-engineer.toml`. Roadmap dài hạn nằm tại `.agent/IMPLEMENTATION_PLAN.md`; lịch sử task nằm tại `.agent/WORKLOG.md`; quy trình production nằm tại `docs/DEPLOYMENT_RUNBOOK.md`.
