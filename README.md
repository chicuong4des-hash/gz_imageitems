# Thiệp Cưới Studio — MVP source code

Một nền tảng thiết kế thiệp cưới riêng cho chủ web: dashboard nhiều dự án, editor kéo thả, thêm chữ/ảnh/đường nét, chỉnh màu/kích thước/vị trí/độ mờ, chọn hiệu ứng cơ bản, lưu và xuất bản link.

## Yêu cầu
- Node.js 20+
- (Khuyến nghị khi triển khai thật) Tài khoản Supabase miễn phí
- Vercel để deploy Next.js

## Chạy thử local
```bash
npm install
npm run dev
```
Mở http://localhost:3000. Nếu chưa cấu hình Supabase, app dùng localStorage trên trình duyệt hiện tại. Chế độ này chỉ demo: dự án và link public không chia sẻ được qua thiết bị/trình duyệt khác.

## Bật lưu online + link công khai
1. Tạo project tại https://supabase.com.
2. Mở SQL Editor, chạy nội dung `supabase/schema.sql`.
3. Vào Authentication > Providers, bật Email. Tắt sign-ups công khai nếu có tuỳ chọn.
4. Vào Authentication > Users > Add user, tạo tài khoản của riêng bạn.
5. Chọn user vừa tạo và thêm `app_metadata`:
   ```json
   { "owner": true }
   ```
   `app_metadata` phải được quản trị viên gán; không dùng `user_metadata` do người dùng tự sửa được.
6. Copy Project URL và anon/public key trong Project Settings > API.
7. Tạo file `.env.local` từ `.env.example` và điền:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
8. Cài dependencies và chạy `npm run dev`. Đăng nhập bằng user đã tạo.
9. Khi muốn deploy: push thư mục này lên GitHub; import repository vào https://vercel.com; điền hai biến môi trường Supabase giống bước 7 trong Vercel Project Settings > Environment Variables; deploy.
10. Sau khi có domain, cập nhật `NEXT_PUBLIC_SITE_URL` bằng domain thật và redeploy.

## Dùng app
- Dashboard: tạo nhiều dự án, mở lại hoặc xóa dự án.
- Editor: kéo thả đối tượng, chọn layer để chỉnh thuộc tính, thêm chữ/ảnh/đường, đổi nền, xem trước, lưu.
- Bấm **Xuất bản** để đánh dấu public và sao chép link `/i/<slug>`.
- Bỏ xuất bản bằng cách chuyển `is_public` về false trong DB hoặc bổ sung nút unpublish sau.

## Các giới hạn MVP hiện tại
- Canvas dùng Konva, lưu bố cục dưới dạng JSON trong bảng `projects`.
- Ảnh upload hiện được nhúng data URL trong JSON; phù hợp thử nghiệm ảnh nhỏ. Bản production nên tải ảnh lên Supabase Storage để tránh giới hạn kích thước row và tăng tốc.
- Animation hiện có lựa chọn `fade`, `float`, `zoom` trong editor nhưng trang public hiện render bố cục tĩnh. Muốn animation chạy thực sự trên link công khai cần thêm runtime/timeline animation ở trang public.
- Chưa có nhạc nền, timeline keyframes, undo/redo, resize handles nâng cao, mẫu template nhiều trang, RSVP database hay analytics.
- Khi dùng Supabase, RLS là lớp bảo vệ dữ liệu chính. Chỉ tài khoản có `app_metadata.owner=true` được thao tác dữ liệu riêng; public chỉ đọc thiệp đã xuất bản.
- `AuthGate` dùng email allowlist tuỳ chọn phía client để cải thiện UX, nhưng quyền truy cập dữ liệu vẫn cần RLS. Đừng bao giờ đặt service-role key ở biến `NEXT_PUBLIC_*`.

## Gợi ý giai đoạn 2
1. Supabase Storage cho ảnh/video/audio.
2. Timeline animation thật trên trang public.
3. Undo/redo, phím tắt, căn lề, snap guides, layer reorder.
4. Template library và nhiều trang thiệp.
5. RSVP lưu database, QR code, thống kê lượt xem.
