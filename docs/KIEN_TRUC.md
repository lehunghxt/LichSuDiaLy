# Kiến trúc mã nguồn (`src/`)

Cập nhật 08/11/2026. Mục tiêu: thêm tính năng mới mà không phải sửa khắp nơi, và sửa giao diện một thiết bị không ảnh hưởng thiết bị khác.

Các quy tắc dưới đây đều được kiểm tra tự động bằng test (cột "Kiểm tra bởi"). Vi phạm quy tắc thì `npm run verify` báo đỏ.

## Các tầng và chiều phụ thuộc

```
app  →  pages  →  features  →  components / lib / types / data / styles
```

Tầng trên được dùng tầng dưới. Tầng dưới không bao giờ dùng tầng trên.

| Thư mục | Chứa gì | Được dùng |
|---|---|---|
| `main.tsx`, `app/` | Khởi động, đường dẫn (`router.tsx`), khung trang theo thiết bị (`app/layout/`: header, menu, chân trang) | mọi tầng |
| `pages/<trang>/` | Mỗi trang một thư mục: `XxxPage.tsx` (lấy dữ liệu, giữ trạng thái), các file bố cục `Xxx.mobile.tsx`/`Xxx.tablet.tsx`/`Xxx.desktop.tsx`, và test của trang | features, components, lib, types, data |
| `features/<tính năng>/` | Nghiệp vụ: `content` (bài học, khung xem bài), `map` (bản đồ, khung thông tin), `quiz`, `progress`, `images`, `sources` | features khác (qua `index.ts`), components, lib, types, data |
| `components/` | Khối giao diện chung, không biết gì về bài học: `sheet/` (bottom sheet), `dialog/`, `ui/`, `layout/` (`ByDevice`, thanh tab) | components, lib, types |
| `lib/` | Tiện ích thuần: `device.ts` (thiết bị), `validate.ts` (kiểm tra JSON), `publishing.ts` (nháp/đã duyệt), `provinces.ts` | lib, types, data |
| `types/` | Kiểu dữ liệu dùng chung | types |
| `data/` | Nội dung JSON: `regions/<vùng>/` (`outline.json`, `sections/*.json`, `quizzes.json`), ảnh Commons | — |
| `styles/index.css` | Màu, hiệu ứng, thứ tự lớp chồng | — |
| `test/` | Công cụ test và các test canh gác quy tắc | — |

## Quy tắc

| Quy tắc | Vì sao | Kiểm tra bởi |
|---|---|---|
| Phụ thuộc chỉ đi xuống (bảng trên) | Khối chung không bị buộc vào một tính năng; đổi tính năng không làm vỡ khối chung | `src/test/architecture.test.ts` |
| Tính năng không phụ thuộc vòng tròn vào nhau | Sửa một bên không làm vỡ bên kia; vẫn tách và tải riêng được | `src/test/architecture.test.ts` |
| Bên ngoài chỉ dùng tính năng qua `features/<x>/index.ts` | Bên trong tính năng sắp xếp lại thoải mái, chỉ cần giữ "cửa chính" | `src/test/architecture.test.ts` |
| Lớp responsive (`sm:`, `md:`, `lg:`…) chỉ có trong file bố cục `*.mobile.tsx`/`*.tablet.tsx`/`*.desktop.tsx`/`*Layout.tsx` | Sửa giao diện một thiết bị không lan sang thiết bị khác. Component dùng chung đổi kiểu bằng prop hoặc container query (`@md:`) | `src/test/responsiveClasses.test.ts` |
| Chọn bố cục theo thiết bị bằng `<ByDevice mobile tablet desktop />` (`tablet` bỏ trống thì dùng `desktop`) | Một cách duy nhất, đổi ngay khi xoay máy | đọc code (chỉ `ByDevice` so sánh thiết bị) |
| Lớp chồng dùng tên (`z-map-ui` < `z-overlay` < `z-nav` < `z-dialog` < `z-viewer`), không viết số `z-[…]` | Thêm lớp mới không đè sai thứ tự | `src/test/zLayers.test.ts` |
| Trang chủ không tải code của trang bản đồ; Leaflet chỉ tải ở trang bản đồ; chunk ban đầu < 150KB gzip | Trang đầu mở nhanh trên điện thoại | `scripts/check-dist.mjs` (trong `npm run verify`) |

Lưu ý về `index.ts`: `vite.config.ts` khai báo các file này "không có tác dụng phụ". Nhờ vậy khi chia chunk, Rollup đi thẳng tới file gốc thay vì gom cả tính năng vào một chunk. Đừng đặt code có tác dụng phụ (import CSS, đoạn chạy khi nạp module) vào `index.ts`.

## Bố cục theo thiết bị

- `lib/device.ts` là nơi duy nhất định nghĩa thiết bị:
  - `mobile`: dưới 768px;
  - `tablet`: 768–1023px;
  - `desktop`: từ 1024px.
- Mỗi màn hình có khác biệt giữa các thiết bị thì có các file `<Tên>.mobile.tsx`, `<Tên>.tablet.tsx`, `<Tên>.desktop.tsx` đặt cạnh component chọn chúng (bằng `ByDevice`):
  - trang chủ: `pages/home/Home.{mobile,tablet,desktop}.tsx`;
  - bản đồ: `pages/map/MapLayout.{mobile,tablet,desktop}.tsx`;
  - khung xem bài: `features/content/section-modal/SectionModal.{mobile,tablet,desktop}.tsx`;
  - khung trang: `app/layout/SiteLayout.{mobile,tablet,desktop}.tsx`;
  - hộp xác nhận, xem ảnh: `components/ui/confirm-dialog/ConfirmDialog.{mobile,desktop}.tsx`, `components/ui/image-viewer/ImageViewer.{mobile,desktop}.tsx` (máy tính bảng dùng bản desktop).
- Thiết bị nào giống thiết bị khác thì không cần file riêng: `ByDevice` cho máy tính bảng dùng bản desktop khi không có bản tablet.
- Tên file theo màn hình, tên component bên trong theo thiết bị (`Home.mobile.tsx` xuất `MobileHome`). Test `src/test/responsiveClasses.test.ts` chặn kiểu tên cũ `MobileXxx.tsx`.
- File bố cục chỉ sắp đặt. Trạng thái và logic nằm ở component cha.
- Trên điện thoại ưu tiên tấm trượt, dùng `components/sheet/`:
  - `BottomSheet`: dạng hộp thoại (khung xem bài, xác nhận, xem ảnh);
  - `SnapSheet`: tấm không chặn, có các mức peek / half / full (thông tin vùng);
  - `SideDrawer`: thanh bên trượt từ mép phải (menu ☰), vuốt sang phải để đóng.

## Công thức thêm một tính năng

Ví dụ: "Nông sản tiêu biểu" của vùng và tỉnh (xem `docs/TIEN_DO_2026-11-07.md`).

1. **Dữ liệu.** Thêm JSON trong `src/data/`. Nếu dữ liệu theo vùng thì đặt trong `data/regions/<vùng>/`.
   - Mỗi mục có `status` (`draft`/`verified`) và nguồn.
   - Nội dung ngoài SGK phải được chủ dự án duyệt, để `draft` và gắn nhãn "Ngoài SGK".
   - Toạ độ phải có nguồn (Wikidata P625).
2. **Đọc và kiểm tra.** Viết `features/<x>/parse.ts` dùng `lib/validate.ts`, kèm test: file sai quy ước thì báo lỗi kèm đường dẫn trường. Lọc nháp/đã duyệt bằng `lib/publishing.ts`.
3. **Giao diện.** Viết `features/<x>/ui/…` (hoặc file ngay trong `features/<x>/`).
   - Không dùng lớp responsive. Cần nhiều kiểu thì nhận prop; co giãn theo khung chứa thì dùng `GRID` hoặc `@container`.
4. **Cửa chính.** Viết `features/<x>/index.ts`, chỉ xuất những gì bên ngoài cần.
5. **Gắn vào.** Import từ `features/<x>` ở trang hoặc khối cần dùng. Ví dụ với nông sản: thêm vào `features/map/info-panel/MapInfoPanel.tsx` (khung vùng) và `ProvinceCard.tsx` (thẻ tỉnh).
   - Nếu tính năng là trang mới: tạo `pages/<trang>/`, rồi khai báo đường dẫn lazy trong `app/router.tsx`.
6. **Kiểm tra.**
   - `npm run verify`: test, kiểu, build, ngân sách dung lượng.
   - Mở thử ở 390 / 820 / 1280px.
   - Bản đồ Việt Nam luôn hiện Hoàng Sa, Trường Sa.

## Lệnh

- Định dạng: `npx prettier --single-quote --no-semi --print-width 140 --write <file>`
- Kiểm tra toàn bộ: `npm run verify`
- Deploy: xem `docs/DEPLOY.md` (cần chủ dự án đồng ý mỗi lần)
