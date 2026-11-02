# Phân rã task — MVP

Chi tiết kỹ thuật từng task (interface, test) nằm trong `docs/superpowers/plans/2026-11-02-em-kham-pha-mvp.md`. File này liệt kê task con, phụ thuộc, ước lượng và use case liên quan.

**Nguồn tham khảo chính:** SGK Lịch sử và Địa lí 4: https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172 (viewer JS, phải tra thủ công; chỉ dùng để đối chiếu và diễn đạt lại, không chép ảnh hay lược đồ). Các task có đánh dấu 📖 phải đối chiếu với nguồn này.

**Ưu tiên:** làm desktop trước. Tablet và điện thoại để giai đoạn sau (T13, sau M6).

**Ước lượng:** S ≤ 2 giờ · M ≈ nửa ngày · L ≈ 1 ngày (1 người hoặc agent).
**Ký hiệu:** 🔒 = bị chặn bởi quyết định chưa chốt (D1–D10, xem plan Task 0).

## Sơ đồ phụ thuộc

```text
T0 Chốt quyết định
 ├─► T2 Dữ liệu nội dung 🔒D1,D4 ─┬─► T7 Trang vùng + địa danh ─┐
 │                               ├─► T9 Quiz cơ bản ─► T10 Quiz nâng cao
 │                               └─► T8 Tiến độ ───────────────┤
 └─► T4 Dữ liệu bản đồ 🔒D2,D3,D5 ─► T5 Bản đồ vùng ─► T6 Tỉnh + marker ─┤
T1 Khung dự án ─► (mọi task)                                            │
T3 Nén ảnh + SmartImage ─► T6, T7, T11                                  ▼
                                               T11 Trang chủ ─► T12 Build + deploy
```

Làm song song được: **T1 → (T3 ∥ T0)**, sau đó **T2 ∥ T4**, rồi **T5–T6 ∥ T7–T9**.

## Mốc (milestone)

| Mốc | Gồm | Kết quả demo được |
|---|---|---|
| **M1 Khung** | T1, T3 | App chạy, điều hướng 4 trang, ảnh nén + lazy load hoạt động |
| **M2 Dữ liệu** | T0, T2, T4 | Nội dung mẫu và GeoJSON có nguồn, test toàn vẹn dữ liệu pass |
| **M3 Bản đồ** | T5, T6 | Chọn vùng TD&MNBB, xem marker, popup ← **điểm dừng duyệt bản đồ** |
| **M4 Học tập** | T7, T8 | Xem chủ đề, chi tiết địa danh, tiến độ lưu được |
| **M5 Trò chơi** | T9, T10 | 4 dạng trò chơi chạy được |
| **M6 Phát hành** | T11, T12 | Bản desktop hoàn chỉnh, deploy production ← **điểm dừng duyệt nội dung** |
| **M7 Mobile** (sau) | T13 | Tối ưu cho tablet và điện thoại |

---

## T0 — Chốt quyết định (không code)

| ID | Việc | Cỡ | Người làm |
|---|---|---|---|
| T0.1 | 📖 Xác nhận tên bộ sách trên bìa của SGK nguồn (D1) | S | Chủ dự án |
| T0.1b | 📖 Lập `docs/SGK_INDEX.md`: các bài về TD&MNBB (số bài, tên, trang), mục tiêu bài, địa danh, lễ hội, khoáng sản, di tích được nhắc tới (kèm trang) | M | Giáo viên, hoặc agent qua Chrome |
| T0.2 | 📖 Lập bảng tỉnh cũ → vùng theo lược đồ trong SGK nguồn, ghi số trang (D2) | S | Chủ dự án hoặc giáo viên |
| T0.3 | Tìm nguồn ranh giới 34 tỉnh mới, đánh giá giấy phép (D3, D5) | M | Agent đề xuất, chủ dự án chốt |
| T0.4 | Chốt quy trình duyệt nội dung, nguồn ảnh và audio (D4, D6, D7) | S | Chủ dự án |
| T0.5 | Gửi ảnh giao diện tham khảo (D8); chốt host (D9) | S | Chủ dự án |
| T0.6 | Ghi `docs/DECISIONS.md` | S | Agent |

## T1 — Khung dự án · UC01, UC02, UC08, UC10 (khung)

| ID | Việc | Cỡ |
|---|---|---|
| T1.1 | `git init`, scaffold Vite React-TS, bật TS strict | S |
| T1.2 | Cài Tailwind v4, font Be Vietnam Pro, token màu, focus ring, reduced-motion | S |
| T1.3 | Cấu hình ESLint, Vitest, RTL, jsdom; thêm các script npm | S |
| T1.4 | Router + lazy page + LoadingState + ErrorBoundary + NotFound | M |
| T1.5 | Layout: Header desktop, menu ☰ cơ bản cho màn hình hẹp, footer | M |
| T1.6 | UI cơ bản: Button, Card, EmptyState, ErrorState | S |
| T1.7 | Test router + nav; chạy typecheck, lint, build | S |

## T2 — Dữ liệu nội dung 🔒D1, D4 · UC05, UC06, UC12, UC13

| ID | Việc | Cỡ |
|---|---|---|
| T2.1 | Định nghĩa type `content.ts`, `quiz.ts` | S |
| T2.2 | Parser JSON → typed, báo lỗi theo đường dẫn trường | M |
| T2.3 | Repository: nạp động theo vùng, cache, lọc draft | M |
| T2.4 | Hook `useRegionContent` (loading, ready, not_found, error) | S |
| T2.5 | 📖 Soạn nội dung mẫu: 5 chủ đề × ≥ 2 mục, chỉ lấy mục có trong `SGK_INDEX.md`, mỗi mục trích bài + trang, status draft | L |
| T2.6 | 📖 Soạn quiz mẫu ≥ 8 câu, đủ 4 dạng, bám mục tiêu bài trong SGK, mỗi câu trích bài + trang | M |
| T2.7 | Test toàn vẹn dữ liệu (id trùng, tham chiếu, ảnh, tọa độ, mục verified phải có nguồn SGK) | M |
| T2.8 | Viết `CONTENT_GUIDE.md` | S |

## T3 — Nén ảnh và lazy load · UC06, UC14

| ID | Việc | Cỡ |
|---|---|---|
| T3.1 | Script `sharp`: AVIF/WebP × 4 width, strip metadata, bỏ qua ảnh đã xử lý | M |
| T3.2 | Sinh `image-manifest.json` (kích thước, ảnh mờ LQIP), cảnh báo ảnh quá lớn | S |
| T3.3 | `SmartImage`: `<picture>`, srcset/sizes, lazy, width/height, LQIP | M |
| T3.4 | Fallback ảnh lỗi hoặc thiếu; hiện credit | S |
| T3.5 | Test SmartImage; ghi mục Ảnh trong `DATA_SOURCES.md` | S |

## T4 — Dữ liệu bản đồ 🔒D2, D3, D5 · UC02, UC03, UC04, UC15

| ID | Việc | Cỡ |
|---|---|---|
| T4.1 | Tải GeoJSON gốc vào `raw/geo/`, kiểm tra CRS và giấy phép | M |
| T4.2 | 📖 Script `mapshaper`: gán regionId theo bảng T0.2, dissolve thành vùng, đơn giản hóa, làm tròn tọa độ | M |
| T4.3 | Xuất lớp tỉnh theo vùng (nếu D3 có dữ liệu) | S |
| T4.4 | Thêm `islands.geojson`: Hoàng Sa, Trường Sa, nhãn Biển Đông | S |
| T4.5 | Loader `geo.ts` + type guard + cache + phân loại lỗi | M |
| T4.6 | Test loader + kiểm tra khớp regionId; ghi `DATA_SOURCES.md` | S |

## T5 — Bản đồ vùng · UC02, UC03

| ID | Việc | Cỡ |
|---|---|---|
| T5.1 | `VietnamMap` lazy, không tile nền, maxBounds, tắt zoom con lăn, giới hạn chiều cao | M |
| T5.2 | `RegionLayer`: tô màu, hover, chọn (setStyle), fitBounds | L |
| T5.3 | `IslandLabels` | S |
| T5.4 | `useMapSelection` đồng bộ với URL `/ban-do/:regionId` | M |
| T5.5 | `RegionList` (bàn phím), `MapControls` (zoom, "Về bản đồ Việt Nam") | M |
| T5.6 | `MapInfoPanel`: tên vùng, tổng quan, 5 chủ đề; thẻ "Sắp ra mắt" | M |
| T5.7 | Layout desktop 2 cột; trạng thái lỗi bản đồ | S |
| T5.8 | Test (mock react-leaflet) | M |

## T6 — Tỉnh và marker · UC03, UC04, UC06

| ID | Việc | Cỡ |
|---|---|---|
| T6.1 | `ProvinceLayer`: hiện khi đã chọn vùng, chọn tỉnh, highlight | M |
| T6.2 | `LocationMarkers`: divIcon theo chủ đề, chỉ hiện mục published có tọa độ | M |
| T6.3 | Popup: tên, chủ đề, ảnh nhỏ, "Xem chi tiết" | S |
| T6.4 | Lọc marker và danh sách theo chủ đề, theo tỉnh | S |
| T6.5 | Test | M |

## T7 — Trang vùng và địa danh · UC05, UC06, UC07

| ID | Việc | Cỡ |
|---|---|---|
| T7.1 | Component `Tabs` theo chuẩn WAI-ARIA (phím mũi tên) | M |
| T7.2 | `RegionPage`: giới thiệu, 5 tab, `?chu-de=` trên URL, trạng thái trống | M |
| T7.3 | `ContentCard` | S |
| T7.4 | `ItemPage`: gallery, vị trí, nổi bật, "Ghi nhớ", liên quan, "Về bản đồ" | M |
| T7.5 | `AudioPlayer` + xử lý lỗi | S |
| T7.6 | Ghi nhận đã xem (dùng hook T8) | S |
| T7.7 | Test | M |

## T8 — Tiến độ · UC10, UC11

| ID | Việc | Cỡ |
|---|---|---|
| T8.1 | `storage.ts`: get, set, remove an toàn | S |
| T8.2 | `progress.ts`: model, parse, các hàm cập nhật thuần, % hoàn thành | M |
| T8.3 | `ProgressProvider` + `useProgress`, không ghi thừa | S |
| T8.4 | `ProgressPage`: thống kê, xem gần đây, ghi chú lưu cục bộ | M |
| T8.5 | Hộp xác nhận xóa tiến độ; banner khi trình duyệt chặn lưu | S |
| T8.6 | Test | M |

## T9 — Quiz cơ bản · UC08, UC09

| ID | Việc | Cỡ |
|---|---|---|
| T9.1 | `engine.ts`: isCorrect, score, shuffle | S |
| T9.2 | `registry.tsx` (map type → view, có kiểm tra kiểu đầy đủ) | S |
| T9.3 | Câu 4 đáp án, câu Đúng/Sai + hiệu ứng phản hồi | M |
| T9.4 | `QuizRunner`: thanh tiến độ câu hỏi, khóa đáp án, giải thích, câu tiếp theo | M |
| T9.5 | `QuizResult`: điểm, xem lại câu sai, chơi lại, ghi kết quả | M |
| T9.6 | `QuizListPage`, `QuizPage`, trạng thái trống và không tìm thấy | S |
| T9.7 | Test | M |

## T10 — Quiz nâng cao · UC08

| ID | Việc | Cỡ |
|---|---|---|
| T10.1 | Mở rộng engine cho map_locate và matching | S |
| T10.2 | `MapLocate`: bản đồ thu gọn + danh sách nút thay thế | L |
| T10.3 | `Matching`: chạm–chạm, hoàn tác, dùng được bằng bàn phím | M |
| T10.4 | Test | M |

## T11 — Trang chủ và hoàn thiện · UC01

| ID | Việc | Cỡ |
|---|---|---|
| T11.1 | Hero, CTA, vùng nổi bật, chủ đề nổi bật, tóm tắt tiến độ | M |
| T11.2 | Chỉnh giao diện theo ảnh tham khảo (D8) | M |
| T11.3 | Kiểm tra ở desktop 1280 và 1920px, zoom 125–150% (máy chiếu); kiểm tra điều hướng bằng bàn phím | M |
| T11.4 | Test | S |

## T12 — Build và deploy · UC16

| ID | Việc | Cỡ |
|---|---|---|
| T12.1 | `index.html`: lang vi, meta, favicon, Open Graph | S |
| T12.2 | SPA fallback (`vercel.json`, `_redirects`), base path qua env | S |
| T12.3 | `check-dist.mjs`: ngưỡng bundle, ảnh, Leaflet không vào entry chunk | M |
| T12.4 | `npm run verify` + Lighthouse (Perf ≥ 90, A11y ≥ 95) | M |
| T12.5 | README, `DEPLOY.md`, báo cáo đã xong và còn hạn chế | M |

## T13 — Tablet và điện thoại (giai đoạn sau)

| ID | Việc | Cỡ |
|---|---|---|
| T13.1 | Rà layout mọi trang ở 375, 768, 1024px; menu ☰, target chạm ≥ 44px | M |
| T13.2 | Bản đồ mobile: chiều cao giới hạn, kéo hai ngón, panel dưới bản đồ hoặc bottom sheet | L |
| T13.3 | Test viewport hẹp + Lighthouse mobile | M |

---

## Tổng ước lượng

| Task | Cỡ tổng | | Task | Cỡ tổng |
|---|---|---|---|---|
| T0 | ~1 ngày (gồm tra SGK lập `SGK_INDEX.md`) | | T7 | ~1.5 ngày |
| T1 | ~1 ngày | | T8 | ~1 ngày |
| T2 | ~2 ngày (nội dung chiếm nhiều nhất) | | T9 | ~1.5 ngày |
| T3 | ~1 ngày | | T10 | ~1.5 ngày |
| T4 | ~1 ngày | | T11 | ~1 ngày |
| T5 | ~2 ngày | | T12 | ~1 ngày |
| T6 | ~1 ngày | | **Tổng** | **~16.5 ngày công cho bản desktop** (+ ~2 ngày cho T13 mobile), chưa tính thời gian giáo viên duyệt nội dung |
