# Em khám phá Lịch sử và Địa lý Việt Nam

Web học tập cho học sinh lớp 4, bám theo SGK Lịch sử và Địa lý 4 (Kết nối tri thức với cuộc sống). Em chọn vùng hoặc tỉnh trên bản đồ Việt Nam, xem nội dung theo dàn ý của sách (thiên nhiên, dân cư và sản xuất, văn hóa, lịch sử), xem ảnh minh họa, tìm hiểu cây trồng tiêu biểu và làm bài ôn tập.

Bản xem thử: https://em-kham-pha-lsdl.vercel.app

## Tính năng

| Trang | Đường dẫn | Nội dung |
|---|---|---|
| Trang chủ | `/` | Bốn vùng theo SGK, mỗi vùng một thẻ có ảnh bìa |
| Bản đồ | `/ban-do`, `/ban-do/:vùng` | Bản đồ 34 tỉnh, thành (sau sắp xếp năm 2025), luôn có Hoàng Sa, Trường Sa. Chọn vùng, chọn tỉnh, bản đồ phóng tới tỉnh đang chọn. Khung thông tin có hai thẻ **Tỉnh** và **Cả vùng**, xem độc lập |
| Vùng | `/vung/:vùng` | Nội dung theo dàn ý SGK |
| Địa danh | `/dia-danh/:mục` | Chi tiết một mục, kèm ảnh |
| Ôn tập | `/on-tap`, `/on-tap/:bài` | 4 bài trắc nghiệm (54 câu), một bài cho mỗi vùng. Có ba dạng câu: một đáp án, Đúng/Sai, Ghép đôi |
| Tiến độ | `/tien-do` | Số mục đã xem, điểm cao nhất từng bài. Tiến độ lưu trên máy em |
| Nguồn tham khảo | `/nguon-tham-khao` | Các trang SGK được dẫn |
| Nguồn ảnh | `/nguon-anh` | Tác giả, giấy phép và trang gốc của mọi ảnh, gồm cả ảnh cây trồng; bảng video lễ hội và kênh đăng |

**Cây trồng tiêu biểu** gồm hai nhóm: *Cây công nghiệp* và *Cây nông nghiệp*. Mỗi cây có một ảnh, bấm vào để xem lớn.
- Ở thông tin vùng: chỉ có các cây SGK nêu, kèm số trang.
- Ở thông tin tỉnh: có nhãn **"Ngoài SGK"** và link nguồn cho từng cây. Hiện có 32 tỉnh với 96 cặp tỉnh–cây. Hà Nội và TP. Hồ Chí Minh để trống vì nguồn không nêu rõ.

**Lễ hội qua video** (ở thông tin tỉnh, nhãn **"Ngoài SGK"**): mỗi tỉnh có ít nhất một video lễ hội từ YouTube (35 video cho 34 tỉnh), của đài truyền hình và báo chí. Dưới mỗi video ghi tên video và kênh đăng; trình phát chỉ tải khi em bấm phát. Danh sách để duyệt: `docs/research/le-hoi-video.md`.

**Núi tiêu biểu** (phần Thiên nhiên của mỗi vùng): 17 núi, dãy núi có tọa độ trên bản đồ và ảnh; núi có trong SGK ghi số trang, núi ngoài SGK có nhãn "Ngoài SGK". Tư liệu: `docs/research/nui/README.md`.

Sau lần mở đầu tiên, service worker (`dist/sw.js`, sinh lúc build) lưu sẵn mã, phông chữ và bản đồ: lần sau mở nhanh hơn và vẫn dùng được khi mất mạng (trừ ảnh, video lấy từ Wikimedia, YouTube). Số liệu ở Trang chủ tính sẵn lúc build (`virtual:home-summary`), không phải tải nội dung của cả bốn vùng.

Giao diện có ba bản riêng cho điện thoại, máy tính bảng và máy tính. Trên điện thoại, thông tin hiện trong bảng trượt từ dưới lên.

## Chạy trên máy

```bash
npm install
npm run dev        # http://localhost:5173
npm run verify     # typecheck, lint, test, build, kiểm tra bản build, e2e
```

Các lệnh khác:

| Lệnh | Việc làm |
|---|---|
| `npm test` | Chạy test unit + integration (Vitest + Testing Library) |
| `npm run test:unit` | Chỉ test unit (`tests/unit/`, cây thư mục giống `src/`; test của script build ở `tests/unit/scripts/`) |
| `npm run test:integration` | Chỉ test integration (`tests/integration/`): cả ứng dụng, router thật, dữ liệu thật; làm bài trắc nghiệm → Tiến độ → xoá tiến độ |
| `npm run test:e2e` | Build rồi chạy e2e bằng Playwright (`tests/e2e/`) trên `vite preview`, Chrome desktop và Pixel 7: bản đồ Leaflet thật, lưu tiến độ qua lần tải lại, chạy offline nhờ service worker. Lần đầu cần `npx playwright install chromium` |
| `npm run build` | Build ra `dist/` |
| `npm run check:dist` | Kiểm tra `dist/`: có `index.html`, `_redirects`, `_headers`, `sw.js` (mọi file nó lưu sẵn đều có trong bản build); chunk ban đầu < 150KB gzip; Leaflet không nằm trong chunk ban đầu; Trang chủ không tải khung bản đồ; ảnh trong `dist/images` ≤ 250KB |
| `npm run images:fetch <vùng>` | Sinh thư viện ảnh của một vùng từ `image-picks/<vùng>.json` (tác giả, giấy phép lấy từ API Wikimedia Commons) |
| `npm run images:fetch -- --produce` | Sinh ảnh cây trồng từ `image-picks/_nong-san.json` ra `src/data/produce/images.json` |
| `npm run images:check [vùng]` | Kiểm tra link ảnh và link trang gốc còn sống |
| `npm run geo` | Sinh lại dữ liệu bản đồ trong `public/maps/` |

## Công nghệ và cấu trúc

React 19 (bật React Compiler qua Babel: memo tự động lúc build), TypeScript (strict), Vite, Tailwind CSS v4, Leaflet / react-leaflet, React Router 7, Vitest.

```
src/
  app/        khung trang, router, bố cục
  pages/      các trang
  features/   content, images, map, produce, progress, quiz, sources, videos
  components/ thành phần giao diện dùng chung
  lib/        kiểm tra dữ liệu, quy tắc xuất bản, tỉnh
  data/       nội dung, ảnh, cây trồng, tỉnh, vùng (JSON)
```

Quy ước chính:
- Thứ tự phụ thuộc: app → pages → features → components / lib / data.
- Bên ngoài một tính năng chỉ được dùng tính năng đó qua `features/<x>/index.ts`.
- File giao diện riêng theo màn hình đặt tên `<Tên>.mobile.tsx`, `<Tên>.tablet.tsx`, `<Tên>.desktop.tsx`.

Các quy ước trên được test kiểm tra tự động. Xem thêm `docs/KIEN_TRUC.md`.

## Thêm nội dung

- **Nội dung học:** `src/data/regions/<vùng>/` gồm các file:
  - `region.json`: giới thiệu vùng;
  - `outline.json`: dàn ý theo SGK;
  - `sections/<phần>.json`: các mục;
  - `quizzes.json`: bài ôn tập.

  Mỗi mục ghi nguồn là trang SGK. Xem `docs/CONTENT_GUIDE.md` và `docs/SGK_INDEX.md`.
- **Ảnh:**
  1. Chọn ảnh trên Wikimedia Commons và xem từng ảnh.
  2. Ghi vào `image-picks/<vùng>.json`.
  3. Chạy `images:fetch` rồi `images:check`.

  Mỗi ảnh đều ghi tác giả, giấy phép và trang gốc ngay dưới ảnh. Xem `docs/DATA_SOURCES.md`.
- **Cây trồng:** `src/data/produce/crops.json`.
  - Cây của vùng lấy theo SGK, có số trang.
  - Cây của tỉnh để `draft` và có nguồn cho từng cây.

  Bằng chứng từng cặp tỉnh–cây (để giáo viên duyệt) nằm ở `docs/research/nong-san/README.md`.
- **Bản đồ:** ranh giới tỉnh lấy từ vietnamese-provinces-database (MIT), sinh bằng `npm run geo`.
- **Kiểm tra toàn vẹn:** dữ liệu được đọc qua bộ kiểm tra; dữ liệu sai thì báo lỗi kèm đường dẫn tới chỗ sai. Test `integrity` chạy trên dữ liệu thật và kiểm tra:
  - mục trong dàn ý phải tồn tại;
  - ảnh phải thuộc đúng tỉnh và vùng;
  - cây nào cũng phải có ảnh.

## Hiện trạng

- Có 137 mục nội dung cho cả 4 vùng, xếp theo dàn ý SGK.
- Có 143 ảnh vùng/tỉnh và 41 ảnh cây trồng, tất cả từ Wikimedia Commons.
- Có 4 bài ôn tập (54 câu).

## Còn hạn chế

- Toàn bộ nội dung hiện có đã duyệt (`status: "verified"`). Bản production chỉ hiện nội dung đã duyệt; nội dung mới thêm vào để `draft` thì chỉ hiện khi chạy dev.
- Các mục dàn ý mà SGK không nói tới được liệt kê trong `docs/OUTLINE_GAPS.md`, chờ giáo viên quyết định.
- Các ô ảnh còn trống (nhất là khoáng sản) ghi trong `docs/IMAGE_GAPS.md`.
- Bộ câu hỏi trắc nghiệm đang cố định trong JSON. Chưa có tùy chọn lấy ngẫu nhiên N câu hay đảo thứ tự câu.
- Lighthouse chưa đo được bằng CLI trên máy phát triển (Node x64 trên chip Apple). Cách đo thủ công:
  1. Mở bản preview trong Chrome.
  2. Vào DevTools → Lighthouse → Desktop.
  3. Mục tiêu: Performance ≥ 90 và Accessibility ≥ 95.

## Tài liệu

| File | Nội dung |
|---|---|
| `docs/KIEN_TRUC.md` | Kiến trúc, quy ước đặt tên |
| `docs/CONTENT_GUIDE.md` | Cách viết nội dung |
| `docs/SGK_INDEX.md` | Mục lục SGK và số trang |
| `docs/DATA_SOURCES.md` | Nguồn dữ liệu, bản đồ, ảnh |
| `docs/DECISIONS.md` | Các quyết định đã chốt |
| `docs/DEPLOY.md` | Triển khai lên Vercel |
| `docs/research/` | Tài liệu nghiên cứu (cây trồng…) |
# LichSuDiaLy
