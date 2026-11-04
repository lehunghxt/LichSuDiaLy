# Hiển thị theo dàn ý vùng (`doc.md`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay 5 chủ đề hiện tại (Đặc điểm tự nhiên, Lễ hội và văn hóa, Khoáng sản, Danh lam thắng cảnh, Di tích lịch sử) bằng dàn ý của từng vùng trong `doc.md`: mỗi vùng có các **phần** (Thiên nhiên / Dân cư và hoạt động sản xuất / Văn hóa) và trong mỗi phần là các **mục** đúng thứ tự `doc.md`.

**Architecture:** Dàn ý là dữ liệu tĩnh `src/data/regions/<regionId>/outline.json` (phần → mục → `itemIds`). Mục nội dung (`ContentItem`) đổi `category` thành `section`. Bản đồ, modal, trang vùng đọc dàn ý để hiển thị; mục chưa có nội dung vẫn hiện tên nhưng ghi "Nội dung đang được cập nhật". Ảnh Commons đổi `category` sang `section` theo cùng quy tắc.

**Tech Stack:** React 19, TypeScript strict, Vite, Tailwind v4, Vitest + Testing Library, dữ liệu JSON tĩnh.

**Spec:** `doc.md` (dàn ý do chủ dự án đưa, 04/11/2026) + `docs/SGK_INDEX.md` (nguồn nội dung). Không có tài liệu thiết kế riêng: chủ dự án yêu cầu lên plan ngay; các quyết định chưa được hỏi ghi ở mục "Cần chốt".

## Cần chốt (mặc định đã chọn, đổi được trước khi làm)

1. **Phần thứ 4 "Lịch sử và di tích"** — `doc.md` không có, nhưng SGK có bài lịch sử ở mỗi vùng (TDMNPB: Bài 7 Đền Hùng và lễ giỗ Tổ). *Mặc định: giữ thành phần thứ 4*, để không mất nội dung SGK đang có (3 mục Đền Hùng).
2. **Mục SGK không có** (ví dụ "Ẩm thực truyền thống", "Nghề dệt lụa Vạn Phúc" nếu sách không nhắc) — *Mặc định: vẫn hiện tên mục, ghi "Nội dung đang được cập nhật"*, không tự viết từ nguồn ngoài; liệt kê trong `docs/OUTLINE_GAPS.md` để giáo viên quyết.
3. **Vùng "Sắp ra mắt"** — *Mặc định: hiện luôn dàn ý (tên phần, tên mục, xám) cùng thư viện ảnh*, nội dung từng mục mở dần khi soạn xong.

## Global Constraints

- Nội dung bám SGK Lịch sử và Địa lí 4 (Kết nối tri thức); **không bịa**. Mục mới luôn `"status": "draft"` và có `sources` trỏ trang SGK.
- Tên phần, tên mục lấy **đúng chữ** trong `doc.md`; phần trong ngoặc (ví dụ "(dãy Hoàng Liên Sơn, đỉnh Phan-xi-păng, đồi trung du)") hiện là dòng gợi ý dưới tên mục.
- Tiếng Việt cho giao diện, định danh tiếng Anh; nháy đơn, không chấm phẩy; không chạy prettier mặc định.
- Desktop trước; bố cục bản đồ toàn màn hình 2/3 – 1/3 giữ nguyên.
- Link cũ `?chu-de=natural|culture|mineral|landmark|historical_site` vẫn mở được (chuyển sang phần tương ứng).

## Review Focus

1. Mục trong dàn ý trỏ tới `itemIds` không tồn tại hoặc thuộc vùng khác → test toàn vẹn phải báo lỗi, không im lặng hiện mục rỗng.
2. Một `ContentItem` không nằm trong mục nào của dàn ý → bị "mất" khỏi giao diện; test toàn vẹn phải báo.
3. Link cũ có `?chu-de=<category cũ>&muc=<slug>` (đã chia sẻ, đã lưu tiến độ) → mở đúng mục, không trắng trang.
4. Vùng chưa có nội dung nhưng có dàn ý → modal mở được, mọi mục ghi "đang cập nhật", không lỗi.
5. Tiến độ học tập đã lưu (LocalStorage, theo id mục) → không mất sau khi đổi cấu trúc.

---

## Giai đoạn A — Cấu trúc và giao diện

### Task 1: Kiểu dữ liệu phần/mục và parser dàn ý

**Files:**
- Modify: `src/types/content.ts`
- Create: `src/features/content/parseOutline.ts`, `src/features/content/parseOutline.test.ts`
- Modify: `src/features/content/parse.ts`, `src/features/content/integrity.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const SECTIONS = ['thien-nhien', 'dan-cu-san-xuat', 'van-hoa', 'lich-su'] as const
  export type SectionId = (typeof SECTIONS)[number]
  export const SECTION_LABELS: Record<SectionId, string>
  // 'Thiên nhiên' | 'Dân cư và hoạt động sản xuất' | 'Văn hóa' | 'Lịch sử và di tích'
  export interface OutlineTopic { id: string; title: string; hint?: string; itemIds: string[] }
  export interface OutlineSection { id: SectionId; topics: OutlineTopic[] }
  export interface RegionOutline { regionId: string; sections: OutlineSection[] }
  export function parseOutline(raw: unknown, regionId: string, path: string): RegionOutline
  export function checkOutlineIntegrity(outline: RegionOutline, items: ContentItem[]): string[]
  ```
- `ContentItem.category: TopicCategory` → `ContentItem.section: SectionId`. `TopicCategory`/`TOPIC_LABELS` bị xoá ở Task 3 (sau khi giao diện thôi dùng).

- [ ] **Step 1: Test parser** — `parseOutline.test.ts`:
  - `parses sections and topics in file order`
  - `rejects unknown section id`
  - `rejects duplicate topic id within a region`
  - `rejects itemIds with another region prefix`
- [ ] **Step 2: Test toàn vẹn** (Review Focus 1, 2):
  - `checkOutlineIntegrity reports itemIds that do not exist`
  - `checkOutlineIntegrity reports content items missing from the outline`
  - `checkOutlineIntegrity reports item whose section differs from its topic's section`
- [ ] **Step 3: Chạy, thấy fail** — `npx vitest run src/features/content/parseOutline` → FAIL (chưa có module).
- [ ] **Step 4: Cài đặt** theo Interfaces; dùng lại các hàm `obj/arr/str/oneOf` trong `parse.ts`.
- [ ] **Step 5: Chạy lại** → PASS.
- [ ] **Step 6: Commit** `feat(content): region outline types, parser and integrity check`

### Task 2: Dàn ý 4 vùng + chuyển dữ liệu TDMNPB

**Files:**
- Create: `src/data/regions/<4 vùng>/outline.json` (tạo thư mục vùng nếu chưa có, chỉ chứa `outline.json`)
- Modify: `src/data/regions/trung-du-mien-nui-phia-bac/topics/*.json` → `sections/<sectionId>.json`
- Modify: `src/features/content/regionFiles.ts`, `repository.ts`
- Modify: `image-picks/*.json`, `src/data/images/**` (chạy lại `images:fetch`), `src/features/images/parseWebImages.ts`, `scripts/lib/commons.mjs`
- Test: `src/features/content/integrity.test.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces: `repository.loadOutline(regionId): Promise<RegionOutline | null>`; `WebImage.category` → `WebImage.section: SectionId`.

Chuyển 21 mục TDMNPB hiện có vào dàn ý (đúng chữ `doc.md`):

| Mục hiện có (`__slug`) | Phần → mục trong dàn ý |
|---|---|
| `vi-tri-dia-li`, `cot-co-lung-cu` | Thiên nhiên → Vị trí địa lí và bản đồ vùng |
| `dia-hinh`, `dinh-phan-xi-pang` | Thiên nhiên → Địa hình |
| `khi-hau` | Thiên nhiên → Khí hậu |
| `song-ngoi` | Thiên nhiên → Sông ngòi |
| `khoang-san` | Thiên nhiên → Khoáng sản |
| `anh-huong-tu-nhien`, `phong-chong-thien-tai` | Thiên nhiên → Thiên nhiên và cảnh quan tiêu biểu *(lựa chọn của người viết plan; giáo viên xem lại)* |
| `dan-toc` | Dân cư và hoạt động sản xuất → Các dân tộc |
| `ruong-bac-thang` | Dân cư và hoạt động sản xuất → Làm ruộng bậc thang |
| `su-dung-khoang-san` | Dân cư và hoạt động sản xuất → Khai thác khoáng sản |
| `cho-phien` | Văn hóa → Chợ phiên vùng cao |
| `le-hoi-gau-tao` | Văn hóa → Lễ hội Gầu Tào |
| `le-hoi-long-tong` | Văn hóa → Lễ hội Lồng Tồng |
| `mua-xoe-thai` | Văn hóa → Múa xòe Thái |
| `hat-then` | Văn hóa → Hát Then và đàn tính |
| `le-hoi` | Văn hóa → mục đầu tiên có lễ hội *(gộp vào "Lễ hội Gầu Tào"/"Lồng Tồng" nếu trùng ý; quyết khi đọc nội dung, ghi Ruling)* |
| `den-hung`, `le-gio-to`, `truyen-thuyet-hung-vuong` | Lịch sử và di tích → "Đền Hùng và lễ giỗ Tổ Hùng Vương" (tên bài SGK, Bài 7) |

Ảnh: `natural`, `mineral`, `landmark` → `thien-nhien` (trừ ảnh gắn `ruong-bac-thang` → `dan-cu-san-xuat`); `culture` → `van-hoa` (ảnh gắn `dan-toc` → `dan-cu-san-xuat`); `historical_site` → `lich-su`. Đổi trong `image-picks/*.json` bằng script một lần, rồi `images:fetch` lại cả 3 vùng (giữ `verified` vì ảnh và ghi nguồn không đổi).

- [ ] **Step 1: Test** `real outlines in src/data/regions pass integrity` (dùng `checkOutlineIntegrity` cho cả 4 vùng) và `every TDMNPB item appears in exactly one outline topic` → FAIL.
- [ ] **Step 2: Viết 4 file `outline.json`** chép đúng `doc.md` (+ phần "Lịch sử và di tích" theo bài lịch sử SGK của vùng: TDMNPB Bài 7; ĐBBB, BTB&NTB, NB lấy tên bài từ `docs/SGK_INDEX.md`, chưa có thì để phần trống). `id` mục = slug không dấu của tên mục.
- [ ] **Step 3: Chuyển file `topics/` → `sections/`**, đổi `category` → `section` theo bảng trên; cập nhật `regionFiles.ts`, `repository.ts`.
- [ ] **Step 4: Chuyển ảnh** (`parseWebImages`, `commons.mjs`, `image-picks`), chạy `npm run images:fetch` cho 3 vùng đã có ảnh.
- [ ] **Step 5:** `npm test` và `npm run typecheck` → PASS (giao diện vẫn dùng `TOPIC_*` qua lớp chuyển đổi tạm `sectionOfLegacy` nếu cần; xoá ở Task 3).
- [ ] **Step 6: Commit** `refactor(content): outline data for 4 regions; items and images use sections`

### Task 3: Khung bên phải bản đồ hiển thị theo dàn ý

**Files:**
- Modify: `src/features/map/MapInfoPanel.tsx`, `src/features/content/topicIcons.ts` (→ `sectionIcons.ts`), `src/pages/MapPage.tsx`, `src/features/content/links.ts`
- Test: `src/pages/MapPage.test.tsx`

**Interfaces:**
- Consumes: `repository.loadOutline`, `SECTION_LABELS`.
- Produces: URL `?phan=<sectionId>&muc=<topicId>` (thay `?chu-de=&muc=`); `topicSearch(section, topicId)`.

Thiết kế: thay lưới 5 ô "Khám phá theo chủ đề" bằng 3–4 thẻ phần (icon + tên phần + "x/y mục có nội dung"); mỗi thẻ liệt kê tên các mục dạng nút nhỏ, mục chưa có nội dung màu xám kèm chữ "đang cập nhật". Bấm mục → mở modal đúng mục.

- [ ] **Step 1: Test** (MapPage.test.tsx):
  - `region panel shows the outline sections in doc order with their topics`
  - `topic without content is shown greyed with "đang cập nhật"`
  - `clicking a topic opens the modal on that topic` (URL `?phan=thien-nhien&muc=dia-hinh`)
  - `coming-soon region shows its outline greyed and the image gallery` (Cần chốt 3)
  - `legacy ?chu-de=landmark&muc=dinh-phan-xi-pang opens the matching section and topic` (Review Focus 3)
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** cài đặt; xoá `TopicCategory`, `TOPIC_LABELS`, `TOPIC_ICONS` khi không còn nơi dùng.
- [ ] **Step 4:** `npm test`, typecheck → PASS; xem Chrome 1280px và 1512px.
- [ ] **Step 5: Commit** `feat(map): region panel follows the doc.md outline`

### Task 4: Modal theo phần → mục → nội dung

**Files:**
- Modify: `src/features/content/TopicModal.tsx` (→ đổi tên `SectionModal.tsx`), `ItemDetail.tsx`
- Test: `src/features/content/TopicModal.test.tsx` (→ `SectionModal.test.tsx`)

Thiết kế: thanh trên = các phần; cột trái = các mục của phần (đúng thứ tự, kèm dòng gợi ý trong ngoặc); khung phải = nội dung các `ContentItem` của mục (một mục có thể có nhiều item, hiện nối tiếp; ảnh Commons theo `itemIds`). Mục rỗng: "Nội dung đang được cập nhật".

- [ ] **Step 1: Test:**
  - `section tabs follow the outline; current section pressed`
  - `topic list shows titles and hints in outline order`
  - `topic with two items shows both, in outline order`
  - `empty topic shows "Nội dung đang được cập nhật"` (Review Focus 4)
  - giữ các test hiện có: focus trap, Escape, audio lỗi, nguồn SGK, ảnh Commons.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** cài đặt.
- [ ] **Step 4:** `npm test`, typecheck → PASS; xem Chrome.
- [ ] **Step 5: Commit** `feat(content): modal browses sections, topics and items`

### Task 5: Trang chủ, trang vùng, trang mục, tiến độ, ôn tập

**Files:**
- Modify: `src/pages/HomePage.tsx`, `RegionPage.tsx`, `ItemPage.tsx`, `ProgressPage.tsx` (nếu dùng nhóm chủ đề), tests tương ứng.

- [ ] **Step 1: Test:**
  - `home page lists the three sections of each region (no old topic names)`
  - `region page groups items by outline section and topic`
  - `progress saved under old item ids still counts` (Review Focus 5: id mục không đổi)
- [ ] **Step 2:** FAIL → **Step 3:** cài đặt → **Step 4:** `npm test`, typecheck, build, `grep -rn "Danh lam thắng cảnh\|Di tích lịch sử" src` chỉ còn trong dữ liệu.
- [ ] **Step 5: Commit** `feat: home, region and item pages use outline sections`

## Giai đoạn B — Soạn nội dung theo dàn ý (mỗi vùng một task)

Quy trình cho mỗi mục: mở SGK (link trong `docs/SGK_INDEX.md`) đúng bài, ghi ý chính vào `docs/SGK_INDEX.md` nếu chưa có, viết `ContentItem` bằng lời của mình (giọng lớp 4, `docs/CONTENT_GUIDE.md`), `status: "draft"`, `sources` có trang SGK; thêm `itemIds` vào `outline.json`. Mục SGK không nói tới → ghi `docs/OUTLINE_GAPS.md` (vùng, mục, đã tìm ở bài/trang nào), không viết.

Mỗi task kết thúc bằng: `npm test` (toàn vẹn dàn ý), typecheck, build, xem Chrome, commit; báo số mục có nội dung / tổng số mục.

### Task 6: Trung du và miền núi phía Bắc — bổ sung mục còn thiếu
Mục chưa có item sau Task 2: Trang phục truyền thống; Nhà ở và bản làng; Trồng chè và cây ăn quả; Sản xuất thủy điện (Hòa Bình, Sơn La); Nghề thủ công truyền thống; Ẩm thực truyền thống. Nguồn: Bài 4–6 (tr. 18–31).

### Task 7: Đồng bằng Bắc Bộ (Bài 8–14, tr. 36–64) — soạn mới, đổi `status` vùng sang `active` khi mọi phần có ít nhất một mục có nội dung.

### Task 8: Bắc Trung Bộ và Nam Trung Bộ (Bài 15–21, tr. 65–98) — như Task 7.

### Task 9: Nam Bộ (Bài 22–27, tr. 99–120) — như Task 7.

## Liên quan tới plan ảnh (`2026-11-03-web-image-library.md`)

Task 10 của plan ảnh (ảnh Nam Bộ) nên làm **sau Task 2** của plan này, để `image-picks/nam-bo.json` dùng ngay `section` thay vì `category` cũ.
