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

## 3. Bản đồ

_(Bổ sung ở Task 4: nguồn, phiên bản, ngày tham chiếu hành chính, CRS EPSG:4326, giấy phép, mức đơn giản hoá, hạn chế.)_
