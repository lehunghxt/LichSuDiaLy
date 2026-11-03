# Nguồn dữ liệu

## 1. SGK (nguồn đối chiếu nội dung)

- SGK Lịch sử và Địa lí 4: https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172
- Chỉ dùng để đối chiếu và diễn đạt lại. **Không** chép ảnh, lược đồ hay đoạn văn dài từ SGK.

## 2. Ảnh

### Quy trình thêm ảnh

1. Chọn ảnh có giấy phép rõ ràng: Wikimedia Commons (CC BY, CC BY-SA, Public Domain), hoặc ảnh do chủ dự án cung cấp.
2. Đặt tên file theo `imageId`: chữ thường, không dấu, nối bằng `-` (ví dụ `ruong-bac-thang-mu-cang-chai.jpg`). Ảnh gốc nên ≤ 4000px.
3. Chép vào `assets-src/images/`.
4. Chạy `npm run images`. Script sẽ:
   - sinh `public/images/<imageId>-<width>.avif` (quality 50) và `.webp` (quality 72) ở các width 320, 640, 1024, 1600 (không phóng to quá ảnh gốc), xoá metadata EXIF;
   - ghi `src/data/image-manifest.json`: kích thước, các width, ảnh mờ 16px (LQIP);
   - bỏ qua ảnh đã xử lý và chưa thay đổi;
   - cảnh báo nếu ảnh gốc > 4000px hoặc file đầu ra > 250KB.
5. Khai báo ảnh trong nội dung JSON:

```json
{ "imageId": "ruong-bac-thang-mu-cang-chai", "alt": "Mô tả ngắn nội dung ảnh",
  "credit": "Tên tác giả / Wikimedia Commons", "license": "CC BY-SA 4.0",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:..." }
```

### Hiển thị

Component `SmartImage` (`src/components/ui/SmartImage.tsx`):
- dùng `<picture>`: AVIF trước, WebP dự phòng, chọn kích thước theo `sizes`;
- `loading="lazy"` + `decoding="async"`; ảnh hero dùng `priority` (tải ngay, `fetchpriority="high"`);
- đặt sẵn `width`/`height` và `aspect-ratio` nên trang không bị nhảy khi ảnh tải xong; hiện ảnh mờ LQIP trong lúc chờ;
- ảnh thiếu trong manifest hoặc tải lỗi: hiện ô "Hình ảnh đang được cập nhật".

### Danh sách ảnh đang dùng

| imageId | Tác giả | Giấy phép | Nguồn |
|---|---|---|---|
| _(chưa có)_ | | | |

### Ảnh nhúng từ Wikimedia Commons (thư viện ảnh theo tỉnh)

Web chạy trên gói hosting miễn phí, nên ảnh minh hoạ tỉnh/vùng **không lưu trong repo**: trang nhúng thẳng ảnh từ `upload.wikimedia.org` và ghi nguồn đầy đủ.

**Chỉ dùng Wikimedia Commons.** Ghi nguồn không làm cho việc nhúng ảnh có bản quyền thành hợp pháp. Ảnh trên báo, blog, trang du lịch phần lớn giữ mọi quyền và nhiều trang chặn nhúng (ảnh sẽ vỡ). Commons chỉ nhận ảnh giấy phép tự do, cho phép nhúng, và có API trả sẵn tác giả, giấy phép.

**Giấy phép được nhận:** Public domain, CC0, CC BY *x.y*, CC BY-SA *x.y*. Không nhận NC, ND, GFDL đứng riêng hay "fair use". Parser (`src/features/images/parseWebImages.ts`) và script cùng chặn.

**Dữ liệu:**
- `image-picks/<regionId>.json`: danh sách ảnh **người chọn** viết tay (file Commons, tỉnh, chủ đề, mục SGK minh hoạ, `alt`, `caption`, `checked`).
- `src/data/images/<regionId>/<provinceId>.json`, `_toan-vung.json`: **sinh tự động**, không sửa tay (trừ đổi `status` sang `verified`).

**Quy trình thêm ảnh:**
1. Tìm trên Commons theo tên tỉnh mới, tên các tỉnh cũ đã sáp nhập, tên địa danh. Xem thông tin một file: `node scripts/commons-fetch.mjs --show "File:Tên ảnh.jpg"`.
2. **Mở xem ảnh**, xác nhận đúng chủ thể. Viết vào `image-picks/<regionId>.json`: `alt` (thấy gì), `caption` (một câu, chỉ dựa trên mô tả Commons; ghi tên tỉnh mới), `checked` (ngày + đã xem). Ảnh không rõ thuộc tỉnh mới nào thì bỏ.
3. `npm run images:fetch <regionId>`: lấy tác giả, giấy phép, link gốc, các cỡ thumbnail chuẩn (500, 960, 1280px); in bảng số ảnh theo tỉnh × chủ đề và danh sách ảnh bị bỏ qua kèm lý do.
4. `npm test` (kiểm tra tỉnh thuộc đúng vùng, `itemIds` tồn tại, id không trùng), rồi xem trên trình duyệt.
5. Giáo viên duyệt trên bản xem thử, đổi `status` sang `verified`. Chạy lại `images:fetch` vẫn giữ `verified` nếu ảnh và thông tin ghi nguồn không đổi.
6. Tỉnh × chủ đề không tìm được ảnh hợp lệ: ghi vào `docs/IMAGE_GAPS.md`, không lấy ảnh na ná.

**Hiển thị** (`src/components/ui/WebImageFigure.tsx`): khung 4:3, `srcset` theo cỡ chuẩn, `loading="lazy"`, `referrerPolicy="no-referrer"`. Dưới ảnh luôn có "Ảnh: ‹tác giả›, ‹giấy phép›, qua Wikimedia Commons" (link về trang tác giả, giấy phép, trang gốc). Danh sách toàn bộ: trang **/nguon-anh**.

**Link hỏng:** ảnh có thể bị xoá hoặc đổi tên trên Commons. Khi đó khung ảnh hiện "Hình ảnh hiện không tải được" nhưng dòng ghi nguồn vẫn còn. Chạy `npm run images:check [regionId]` trước mỗi lần deploy; thay ảnh hỏng trong `image-picks` rồi chạy lại `images:fetch`.

**Commons chỉ trả thumbnail ở cỡ chuẩn** (500, 960, 1280px…); cỡ khác (ví dụ 700px) trả lỗi 400. API hiện trả link `thumb.wikimedia.org` kèm `utm_*`; script đổi về `upload.wikimedia.org` và bỏ tham số.

## 3. Bản đồ

| Mục | Giá trị |
|---|---|
| Nguồn | [thanglequoc/vietnamese-provinces-database](https://github.com/thanglequoc/vietnamese-provinces-database), bản phát hành **v4.1.0** (01/08/2026), thư mục `json/geojson/<tỉnh>/<tỉnh>.geojson` |
| Giấy phép | **MIT**, © 2021 Thang Le Quoc (bản sao: `raw/geo/thanglequoc-v4.1.0/LICENSE`) |
| Đơn vị hành chính | 34 tỉnh/thành theo sắp xếp năm 2025 (Nghị quyết 202/2025/QH15) |
| Hệ toạ độ | WGS84 kinh độ/vĩ độ (EPSG:4326) |
| Hoàng Sa, Trường Sa | Có: là các phần đảo thuộc Đà Nẵng (Hoàng Sa) và Khánh Hòa (Trường Sa). Bản v4.1.0 đã vá phần đảo bị thiếu ở nguồn gốc. Test `geo.test.ts` kiểm tra hai quần đảo không bị mất khi đơn giản hoá |
| Tỉnh → vùng | `src/data/provinces.json`. 9 tỉnh vùng Trung du và miền núi phía Bắc lấy từ SGK (Hình 3, tr. 25). **Các vùng còn lại chưa đối chiếu lược đồ SGK** (Chủ đề 3–5), cần kiểm tra trước khi mở các vùng đó |

### Quy trình dựng (`npm run geo`)

`scripts/build-geo.mjs` dùng mapshaper:
1. Ghép 34 file tỉnh, gắn `provinceId`, `name`, `regionId` từ `src/data/provinces.json` (báo lỗi nếu thiếu tỉnh).
2. Đơn giản hoá 6% (`weighted keep-shapes`, giữ cả đảo nhỏ), làm tròn toạ độ 4 chữ số (~11 m).
3. Xuất `public/maps/provinces.geojson` (~121 KB) và `public/maps/regions.geojson` (gộp theo vùng, ~61 KB).
4. Xuất `public/maps/labels.geojson`: điểm đặt nhãn "Quần đảo Hoàng Sa", "Quần đảo Trường Sa" (tâm khung bao các phần đảo, tính từ dữ liệu) và chữ "Biển Đông" (vị trí đặt nhãn).

### Hạn chế đã biết

- Dữ liệu cộng đồng, không phải bản đồ chính thức của cơ quan nhà nước; ranh giới đã được đơn giản hoá để hiển thị cho học sinh, không dùng cho mục đích pháp lí.
- Bản đồ không dùng lớp nền (tile) trực tuyến; chỉ vẽ ranh giới tỉnh/vùng.
