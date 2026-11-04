# Em khám phá Lịch sử và Địa lí Việt Nam

Web học tập cho học sinh lớp 4, bám theo SGK Lịch sử và Địa lí 4 (Kết nối tri thức với cuộc sống). Em chọn vùng trên bản đồ Việt Nam, xem nội dung theo dàn ý của sách (thiên nhiên, dân cư và sản xuất, văn hóa, lịch sử), xem ảnh minh họa và làm bài ôn tập.

Bản xem thử: https://em-kham-pha-lsdl.vercel.app

## Chạy trên máy

```bash
npm install
npm run dev        # http://localhost:5173
npm run verify     # typecheck, lint, test, build, kiểm tra bản build
```

Các lệnh khác:

| Lệnh | Việc làm |
|---|---|
| `npm test` | Chạy toàn bộ test (Vitest) |
| `npm run build` | Build ra `dist/` |
| `npm run check:dist` | Kiểm tra `dist/`: có `index.html`, `_redirects`; chunk ban đầu < 150KB gzip; Leaflet không nằm trong chunk ban đầu; ảnh trong `dist/images` ≤ 250KB |
| `npm run images:fetch <vùng>` | Sinh thư viện ảnh của một vùng từ `image-picks/<vùng>.json` (thông tin tác giả, giấy phép lấy từ API Wikimedia Commons) |
| `npm run images:check [vùng]` | Kiểm tra link ảnh và link trang gốc còn sống |
| `npm run geo` | Sinh lại dữ liệu bản đồ trong `public/maps/` |

## Thêm nội dung

- **Nội dung học:** `src/data/regions/<vùng>/` gồm `region.json` (giới thiệu vùng), `outline.json` (dàn ý theo SGK) và `sections/<phần>.json` (các mục). Mỗi mục ghi nguồn là trang SGK. Xem `docs/CONTENT_GUIDE.md` và `docs/SGK_INDEX.md`.
- **Ảnh:** chọn ảnh trên Wikimedia Commons, xem từng ảnh, ghi vào `image-picks/<vùng>.json`, rồi chạy `images:fetch` và `images:check`. Xem `docs/DATA_SOURCES.md`.
- **Bản đồ:** ranh giới tỉnh lấy từ vietnamese-provinces-database (MIT), sinh bằng `npm run geo`.
- **Kiểm tra toàn vẹn:** test `integrity` chạy trên dữ liệu thật: mục trong dàn ý phải tồn tại, ảnh phải thuộc đúng tỉnh và vùng, mục được gắn ảnh phải có thật.

## Đã xong

- Bản đồ 4 vùng theo SGK, chọn vùng, chọn tỉnh, thu phóng, nút về vị trí ban đầu.
- Nội dung nháp của cả 4 vùng (117 mục), đặt theo dàn ý SGK, mỗi mục dẫn trang SGK.
- 143 ảnh Wikimedia Commons cho 4 vùng, có ghi tác giả và giấy phép, xem toàn màn hình, skeleton khi tải.
- Trang Nguồn tham khảo (thống kê các bài, trang SGK được dẫn) và trang Nguồn ảnh.
- Trắc nghiệm (một đáp án, Đúng/Sai, Ghép đôi) cho vùng Trung du và miền núi phía Bắc; lưu tiến độ trên máy.

## Còn hạn chế

- **Nội dung còn là bản nháp** (`status: "draft"`), chờ giáo viên duyệt. Bản build chỉ hiện nội dung nháp khi có `VITE_SHOW_DRAFTS=true`; thiếu cờ này, các chủ đề sẽ trống.
- Các mục dàn ý SGK không nói tới được liệt kê trong `docs/OUTLINE_GAPS.md`, chờ giáo viên quyết định.
- Ô ảnh còn trống (nhất là khoáng sản) ghi trong `docs/IMAGE_GAPS.md`.
- Chỉ vùng Trung du và miền núi phía Bắc có bài ôn tập.
- Lighthouse chưa đo được bằng CLI trên máy phát triển (Node x64 trên chip Apple). Đo thủ công: mở bản preview trong Chrome, DevTools → Lighthouse → Desktop, mục tiêu Performance ≥ 90 và Accessibility ≥ 95.

## Triển khai

Xem `docs/DEPLOY.md`.
