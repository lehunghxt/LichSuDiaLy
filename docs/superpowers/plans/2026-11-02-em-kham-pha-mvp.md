# Em khám phá Lịch sử và Địa lí Việt Nam — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Website tĩnh (React + TSX) cho học sinh lớp 4 khám phá vùng Trung du và miền núi Bắc Bộ qua bản đồ 2D, nội dung theo 5 chủ đề, 4 dạng trò chơi và theo dõi tiến độ bằng LocalStorage.

**Architecture:** SPA Vite, chia theo feature (`map`, `content`, `quiz`, `progress`). Nội dung học tập là JSON trong `src/data/`, được parse/kiểm tra kiểu khi nạp, import động theo từng vùng (code-split, không fetch API). Dữ liệu bản đồ là GeoJSON tĩnh trong `public/maps/`, sinh ra bằng script từ nguồn có giấy phép, render bằng Leaflet **không dùng tile nền** (tránh phụ thuộc mạng và nhãn biển/đảo sai). Ảnh gốc được nén bằng script `sharp` thành AVIF/WebP nhiều kích thước, kèm manifest kích thước + ảnh mờ xem trước (LQIP).

**Tech Stack:** React 19, TypeScript (strict), Vite, Tailwind CSS v4 (`@tailwindcss/vite`), React Router (library mode), Leaflet + React Leaflet, Lucide React, `@fontsource/be-vietnam-pro`, Vitest + React Testing Library + jsdom. Dev-only: `sharp` (nén ảnh), `mapshaper` (đơn giản hóa/gộp GeoJSON). Phiên bản: bản stable mới nhất tương thích nhau tại thời điểm cài; kiểm tra API theo bản đã cài (đặc biệt React Leaflet ↔ React 19, Tailwind v4 không dùng `tailwind.config.js`).

**Spec:** `req.md` (thư mục gốc dự án)

**Nguồn tham khảo chính (SGK):** SGK Lịch sử và Địa lí 4, bản đọc trên trang tập huấn của NXB Giáo dục Việt Nam: https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172
- Đây là nguồn chuẩn để đối chiếu nội dung, danh sách tỉnh của vùng (lược đồ), quiz và từ ngữ. Mỗi `SourceRef` trích từ sách ghi theo mẫu: `{ title: "SGK Lịch sử và Địa lí 4, Bài <n>: <tên bài>", url: <link trên>, note: "tr. <trang>" }`.
- Trang đọc sách là viewer JavaScript, không có mục lục dạng text ("Chưa có mục lục"), nên không lấy nội dung tự động được. Việc tra cứu làm thủ công (người duyệt) hoặc qua trình duyệt (Claude in Chrome).
- **Bản quyền:** nội dung, hình ảnh và lược đồ trong SGK thuộc quyền của NXB Giáo dục. Chỉ dùng để đối chiếu và diễn đạt lại; **không chép nguyên văn đoạn dài, không chụp lại ảnh hay lược đồ** để đưa lên website.
- Chưa xác định được sách thuộc bộ nào (Kết nối tri thức hay bộ khác) vì trang không hiển thị thông tin bìa ở dạng đọc được. Cần xác nhận ở D1.

## Global Constraints

- Static web hoàn toàn: không backend, database, API server, đăng nhập. Build ra `dist/`.
- Deploy được lên Vercel, Netlify, Cloudflare Pages (SPA fallback cho route lồng nhau).
- **Ưu tiên desktop trước** (≥ 1280px, máy tính, máy chiếu, bảng thông minh). Tablet và điện thoại làm ở giai đoạn sau (Task 13). Trong MVP chỉ cần layout không vỡ khi màn hình hẹp hơn: không có thanh cuộn ngang, nội dung xếp dọc. Chưa tinh chỉnh riêng cho mobile.
- TypeScript `strict: true`; không `any`, không `as` để ép kiểu dữ liệu JSON.
- Không hardcode nội dung học tập hay dữ liệu địa lí trong TSX.
- Không bịa tọa độ, ranh giới, kiến thức lịch sử; nội dung chưa kiểm chứng có `status: "draft"` và **không hiển thị ở bản production**.
- Không dùng ảnh không rõ quyền sử dụng; mỗi ảnh có `credit`, `license`, `sourceUrl`.
- Bản đồ thể hiện quần đảo Hoàng Sa, Trường Sa thuộc Việt Nam, có nhãn tiếng Việt; tên biển là "Biển Đông".
- 5 nhóm kiến thức, đúng nhãn: "Đặc điểm tự nhiên", "Lễ hội và văn hóa", "Khoáng sản", "Danh lam thắng cảnh", "Di tích lịch sử".
- Toàn bộ UI tiếng Việt có dấu. Code/identifier tiếng Anh.
- Ảnh: AVIF + WebP, `loading="lazy"` (trừ ảnh hero), có `width`/`height` để tránh nhảy layout.
- Lazy load theo route; Leaflet + CSS của nó chỉ nằm trong chunk trang bản đồ.
- Tôn trọng `prefers-reduced-motion`.
- Chỉ thêm thư viện khi có lý do rõ ràng; không Redux/Zustand/React Query/zod.
- LocalStorage key: `ekp-progress-v1`.

## Review Focus

1. **LocalStorage bị chặn hoặc hỏng** (Safari private, quota, JSON rác): app vẫn chạy với state trong bộ nhớ, không trắng trang. Test đặt trong Task 8.
2. **URL sai id** (`/vung/abc`, `/dia-danh/xyz`, `/on-tap/zzz`) hoặc refresh trên route lồng nhau ở host tĩnh: hiện trang "Không tìm thấy" thân thiện, có file fallback trong `dist`. Test trong Task 1 và Task 12.
3. **Ảnh thiếu trong manifest hoặc tải lỗi**: hiện ô placeholder có biểu tượng, không hiện icon ảnh vỡ. Test trong Task 3.
4. **Bản đồ "bẫy" thao tác cuộn trang**: trên desktop, cuộn chuột trên bản đồ vẫn cuộn trang (tắt zoom bằng con lăn, có nút +/−) và bản đồ có chiều cao giới hạn. Test trong Task 5. Phần thao tác chạm trên mobile để Task 13.
5. **Nội dung `draft` lọt ra production** (kể cả qua câu hỏi quiz, mục liên quan, phần trăm tiến độ): repository lọc theo một hàm duy nhất. Test trong Task 2 và Task 9.

---

## Task 0: Chốt quyết định (cổng chặn, không code)

Task 2 và Task 4 không bắt đầu được khi chưa chốt các mục D1–D4. Các mục còn lại đã có mặc định, chỉ đổi nếu chủ dự án yêu cầu.

| ID | Quyết định | Mặc định đề xuất |
|---|---|---|
| D1 | Bám bộ SGK nào | **Đã có nguồn:** SGK LS&ĐL 4 trên taphuan.nxbgd.vn (xem "Nguồn tham khảo chính"). Còn cần xác nhận tên bộ sách ghi trên bìa |
| D2 | Danh sách tỉnh (theo 63 tỉnh cũ) của từng vùng địa lí trong SGK | Lấy từ lược đồ các vùng trong sách ở D1, ghi rõ số trang; dùng để gộp polygon vùng |
| D3 | Lớp tỉnh khi bấm vào vùng: 34 tỉnh mới (từ 01/07/2025) hay 63 tỉnh cũ | Đề xuất **34 tỉnh mới** nếu có nguồn ranh giới tin cậy; nếu chưa có thì MVP chỉ có lớp vùng + điểm địa danh, ghi rõ hạn chế |
| D4 | Ai soạn và duyệt nội dung (và có cung cấp ảnh/thuyết minh không) | Agent soạn bản `draft` có trích nguồn; giáo viên duyệt và chuyển sang `verified` |
| D5 | Nguồn GeoJSON | geoBoundaries / OSM (CC BY / ODbL), có bổ sung Hoàng Sa, Trường Sa; ghi trong `docs/DATA_SOURCES.md` |
| D6 | Nguồn ảnh | Wikimedia Commons (CC BY / CC BY-SA / PD) + ảnh chủ dự án tự cung cấp |
| D7 | Video / audio | MVP: chỉ hỗ trợ audio tùy chọn (`<audio>`); chưa có video |
| D8 | Ảnh giao diện tham khảo nêu trong `req.md` §4 | **Cần gửi lại**: ảnh không có trong file |
| D9 | Host chính | Vercel (vẫn kèm cấu hình Netlify/Cloudflare) |
| D10 | Các vùng khác trên bản đồ | Vẫn tô màu và bấm được, hiện thẻ "Sắp ra mắt" |

- [ ] **Step 1:** Tra SGK (link ở "Nguồn tham khảo chính"), lập `docs/SGK_INDEX.md` gồm: tên bộ sách, các bài thuộc vùng Trung du và miền núi Bắc Bộ (số bài, tên bài, trang), mục tiêu bài học, các địa danh, lễ hội, khoáng sản, di tích được nhắc tên (kèm trang), danh sách tỉnh trên lược đồ vùng (kèm trang).
- [ ] **Step 2:** Ghi kết quả D1–D10 vào `docs/DECISIONS.md`.

---

## File Structure

```text
scripts/
  optimize-images.mjs        # sharp: assets-src/images → public/images + src/data/image-manifest.json
  build-geo.mjs              # mapshaper: raw/ → public/maps/*.geojson (simplify, dissolve)
assets-src/images/           # ảnh gốc (không ship)
raw/geo/                     # GeoJSON gốc tải về (không ship)
public/maps/
  regions.geojson            # polygon vùng SGK (properties.regionId)
  provinces/<regionId>.geojson
  islands.geojson            # Hoàng Sa, Trường Sa (điểm + nhãn)
public/images/               # <imageId>-<w>.avif|webp (sinh tự động)
public/_redirects            # Netlify/Cloudflare SPA fallback
vercel.json                  # Vercel SPA rewrite
src/
  main.tsx
  app/App.tsx, app/router.tsx, app/ErrorBoundary.tsx
  components/layout/AppLayout.tsx, Header.tsx, MobileNav.tsx
  components/ui/Button.tsx, Card.tsx, EmptyState.tsx, ErrorState.tsx, LoadingState.tsx, SmartImage.tsx, Tabs.tsx
  data/
    regions.json             # danh sách vùng (metadata, màu, status)
    regions/<regionId>.json  # nội dung + quiz của vùng
    image-manifest.json      # sinh tự động
  types/content.ts, types/quiz.ts
  lib/storage.ts             # đọc/ghi localStorage an toàn
  features/content/
    parse.ts                 # unknown → typed, ném ContentError
    repository.ts            # API truy vấn nội dung (cache trong bộ nhớ)
    useRegionContent.ts
    components/TopicTabs.tsx, ContentCard.tsx, ItemDetail.tsx, AudioPlayer.tsx
  features/map/
    geo.ts                   # tải + kiểm tra GeoJSON
    VietnamMap.tsx           # MapContainer, lazy
    RegionLayer.tsx, ProvinceLayer.tsx, LocationMarkers.tsx, IslandLabels.tsx
    MapControls.tsx, RegionList.tsx, MapInfoPanel.tsx
    useMapSelection.ts
  features/quiz/
    engine.ts                # grade, score (pure)
    registry.tsx             # type → renderer component
    questions/SingleChoice.tsx, TrueFalse.tsx, MapLocate.tsx, Matching.tsx
    QuizRunner.tsx, QuizResult.tsx
  features/progress/
    progress.ts              # model + reducer (pure)
    ProgressProvider.tsx, useProgress.ts
  pages/HomePage.tsx, MapPage.tsx, RegionPage.tsx, ItemPage.tsx, QuizListPage.tsx, QuizPage.tsx, ProgressPage.tsx, NotFoundPage.tsx
  styles/index.css           # Tailwind v4 @theme tokens
docs/DECISIONS.md, docs/DATA_SOURCES.md, docs/CONTENT_GUIDE.md
```

Routes (slug không dấu):

| Route | Page |
|---|---|
| `/` | HomePage |
| `/ban-do` | MapPage |
| `/ban-do/:regionId` | MapPage (vùng đã chọn, URL chia sẻ được) |
| `/vung/:regionId` | RegionPage |
| `/dia-danh/:itemId` | ItemPage |
| `/on-tap` | QuizListPage |
| `/on-tap/:quizId` | QuizPage |
| `/tien-do` | ProgressPage |
| `*` | NotFoundPage |

Trạng thái vùng/tỉnh/địa danh đang chọn trên bản đồ nằm trong URL (`regionId`) + state cục bộ của `useMapSelection`. Chỉ tiến độ học tập dùng Context (dùng ở nhiều trang).

---

### Task 1: Khởi tạo dự án, layout, routing

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `vitest.setup.ts`, `index.html`, `src/main.tsx`, `src/app/*`, `src/components/layout/*`, `src/components/ui/{Button,Card,EmptyState,ErrorState,LoadingState}.tsx`, `src/pages/*` (placeholder), `src/styles/index.css`
- Test: `src/app/router.test.tsx`

**Interfaces:**
- Produces: `routes` (mảng `RouteObject`, export từ `src/app/router.tsx`, dùng với `createBrowserRouter` và `createMemoryRouter` trong test); `<EmptyState title description action?>`, `<ErrorState title description onRetry?>`, `<LoadingState label>`.

- [ ] **Step 1:** `git init`; scaffold Vite React-TS; cài dependency ở Tech Stack; `tsconfig` strict + `noUncheckedIndexedAccess`; scripts `dev`, `build` (`tsc -b && vite build`), `preview`, `test`, `lint`, `typecheck`.
- [ ] **Step 2:** Viết token màu trong `@theme` của `src/styles/index.css`: primary `#2563EB`, secondary `#16A34A`, accent `#F59E0B`, bg `#F8FAFC`, text `#1E293B`, surface `#FFFFFF`, cùng một màu cho mỗi vùng. Import font Be Vietnam Pro 400/600/700 (subset `vietnamese`). Cỡ chữ body tối thiểu 16px (18px trên tablet trở lên). Focus ring rõ ràng. Chặn animation dưới `@media (prefers-reduced-motion: reduce)`.
- [ ] **Step 3: Viết test lỗi trước**

```tsx
test("renders home at /", ...)                 // getByRole("heading", { name: /Em khám phá Lịch sử và Địa lí Việt Nam/i })
test("header has 4 nav links", ...)            // "Trang chủ", "Bản đồ khám phá", "Trắc nghiệm", "Tiến độ học tập"
test("unknown route shows not found", ...)     // /khong-co → getByText("Không tìm thấy trang em cần") + link "Về trang chủ"
```

- [ ] **Step 4:** Chạy `npm test -- router`. Kỳ vọng: FAIL.
- [ ] **Step 5:** Viết `routes`: mọi page dùng `lazy()` + `Suspense` với `<LoadingState>`. Có `ErrorBoundary` ở layout (fallback là `<ErrorState>`). Header trên desktop; màn hình hẹp có nút ☰ mở danh sách link (đã làm ở mức cơ bản, tinh chỉnh ở Task 13).
- [ ] **Step 6:** Chạy `npm test && npm run typecheck && npm run lint && npm run build`. Kỳ vọng: tất cả PASS.
- [ ] **Step 7:** Commit `chore: scaffold app shell and routing`.

---

### Task 2: Model nội dung, parser, repository, dữ liệu mẫu

**Files:**
- Create: `src/types/content.ts`, `src/types/quiz.ts`, `src/features/content/parse.ts`, `src/features/content/repository.ts`, `src/features/content/useRegionContent.ts`, `src/data/regions.json`, `src/data/regions/trung-du-mien-nui-bac-bo.json`, `docs/CONTENT_GUIDE.md`
- Test: `src/features/content/parse.test.ts`, `src/features/content/repository.test.ts`, `src/data/content-integrity.test.ts`

**Interfaces:**
- Produces (`src/types/content.ts`):

```ts
export type TopicCategory = "natural" | "culture" | "mineral" | "landmark" | "historical_site";
export const TOPIC_LABELS: Record<TopicCategory, string>; // 5 nhãn trong Global Constraints, đúng thứ tự
export type ContentStatus = "draft" | "verified";
export interface SourceRef { title: string; url?: string; note?: string }      // VD: "SGK LS&ĐL 4 (KNTT), Bài 3, tr. 15"
export interface ImageRef { imageId: string; alt: string; credit: string; license: string; sourceUrl?: string }
export interface MediaRef { src: string; credit: string; license: string }
export interface RegionMeta { id: string; name: string; shortName: string; color: string; status: "active" | "coming_soon"; summary: string }
export interface ContentItem {
  id: string; regionId: string; category: TopicCategory; title: string;
  summary: string;              // 1–2 câu
  highlights: string[];         // đặc điểm nổi bật
  keyPoints: string[];          // kiến thức cần ghi nhớ
  funFacts?: string[];
  location?: { lat: number; lng: number; placeName: string };  // tên tỉnh/địa phương hiển thị
  provinceId?: string;
  images: ImageRef[]; audio?: MediaRef;
  relatedIds: string[]; sources: SourceRef[]; status: ContentStatus;
}
export interface RegionContent { region: RegionMeta; intro: string; items: ContentItem[]; quizzes: Quiz[] }
```

- Produces (`src/types/quiz.ts`): discriminated union.

```ts
interface QuestionBase { id: string; prompt: string; explanation: string; status: ContentStatus }
export type Question =
  | (QuestionBase & { type: "single_choice"; options: [string, string, string, string]; answerIndex: 0 | 1 | 2 | 3 })
  | (QuestionBase & { type: "true_false"; answer: boolean })
  | (QuestionBase & { type: "map_locate"; targetItemId: string; candidateItemIds: string[] })
  | (QuestionBase & { type: "matching"; pairs: { left: string; right: string }[] });
export interface Quiz { id: string; regionId: string; title: string; questions: Question[] }
```

`map_locate` dùng marker của địa danh đã kiểm chứng (tọa độ có nguồn), không dùng polygon tự vẽ.

- Produces (`parse.ts`): `class ContentError extends Error { path: string }`; `parseRegionList(raw: unknown): RegionMeta[]`; `parseRegionContent(raw: unknown): RegionContent`. Viết type guard thủ công, không `as`.
- Produces (`repository.ts`), mọi hàm đã lọc `isPublished`:

```ts
export function isPublished(s: ContentStatus): boolean;   // import.meta.env.PROD ? s === "verified" : true
export function getRegions(): RegionMeta[];
export function loadRegionContent(regionId: string): Promise<RegionContent | null>; // null nếu id không có; cache Map
export function getItemsByCategory(c: RegionContent, cat: TopicCategory): ContentItem[];
export function findItem(itemId: string): Promise<{ item: ContentItem; content: RegionContent } | null>;
export function findQuiz(quizId: string): Promise<{ quiz: Quiz; content: RegionContent } | null>;
```

Nạp bằng `import.meta.glob("../../data/regions/*.json")` (import động, mỗi vùng một chunk). `findItem`/`findQuiz` suy ra regionId từ tiền tố id (quy ước id: `<regionId>__<slug>`), nên không phải nạp hết các vùng.
- `useRegionContent(regionId) → { status: "loading" | "ready" | "not_found" | "error"; content?: RegionContent }`.

- [ ] **Step 1: Viết test lỗi trước**

```ts
// parse.test.ts
test("parseRegionContent throws ContentError with path on missing title")    // path === "items[0].title"
test("rejects single_choice without exactly 4 options")
test("rejects unknown category")
// repository.test.ts
test("loadRegionContent returns null for unknown id")
test("isPublished hides draft in PROD")                                      // vi.stubEnv("PROD", true)
test("getItemsByCategory returns [] for empty category")
test("findItem returns null for malformed id")
// content-integrity.test.ts (chạy trên toàn bộ src/data)
test("all ids unique"); test("relatedIds and map_locate ids resolve")
test("verified items and questions have ≥1 source whose url is the SGK link"); test("every imageId exists in image-manifest.json")
test("location lat/lng inside Vietnam bbox [8.0,102.1]–[23.4,109.5]")
```

- [ ] **Step 2:** Chạy `npm test -- content`. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt các hàm trên. Dữ liệu mẫu: mỗi nhóm ≥ 2 mục và 1 quiz ≥ 8 câu (đủ 4 dạng), tất cả để `status: "draft"` kèm `sources` cho tới khi người duyệt (D4) chuyển sang `verified`. Mỗi mục và mỗi câu hỏi phải có ít nhất 1 `SourceRef` trỏ tới SGK (bài + trang theo `docs/SGK_INDEX.md`); nguồn khác chỉ dùng để bổ sung. Chỉ đưa vào mục nào được SGK nhắc tới, hoặc được giáo viên đồng ý bổ sung. Ứng viên theo `req.md`, cần đối chiếu `SGK_INDEX.md`: Hoàng Liên Sơn / Phan-xi-păng, ruộng bậc thang, khí hậu; lễ hội Lồng Tồng, Xòe Thái, chợ phiên; than, a-pa-tít, sắt, đồng; Sa Pa, cao nguyên đá Đồng Văn; Điện Biên Phủ, Pác Bó, Tân Trào.
- [ ] **Step 4:** Viết `docs/CONTENT_GUIDE.md`: cách thêm vùng hoặc mục, quy ước id, quy trình draft → verified, giọng văn lớp 4 (câu ≤ 20 từ, mỗi `summary` ≤ 2 câu).
- [ ] **Step 5:** Chạy `npm test && npm run typecheck`. Kỳ vọng: PASS.
- [ ] **Step 6:** Commit `feat: typed content model, parser and repository`.

---

### Task 3: Nén ảnh và `SmartImage` (lazy load)

**Files:**
- Create: `scripts/optimize-images.mjs`, `src/components/ui/SmartImage.tsx`, `src/data/image-manifest.json`, `docs/DATA_SOURCES.md` (mục Ảnh)
- Test: `src/components/ui/SmartImage.test.tsx`

**Interfaces:**
- Produces: `image-manifest.json` có dạng `{ [imageId]: { width: number; height: number; widths: number[]; lqip: string } }`.
- Produces: `<SmartImage image: ImageRef; sizes: string; priority?: boolean; className?: string />`.

- [ ] **Step 1: Script.** Đọc `assets-src/images/*.{jpg,jpeg,png,webp}` (tên file = `imageId`). Sinh các width `[320, 640, 1024, 1600]`, không phóng to vượt kích thước gốc. Xuất `public/images/<id>-<w>.avif` (quality 50) và `.webp` (quality 72); strip metadata. LQIP là WebP 16px dạng base64. Bỏ qua file đã có và mới hơn ảnh gốc (chạy lại nhanh). Thêm script `npm run images`. Nếu ảnh gốc > 4000px hoặc file output > 250KB thì in cảnh báo.
- [ ] **Step 2: Viết test lỗi trước**

```tsx
test("renders <picture> with avif and webp srcset from manifest")   // srcset chứa "-640.avif 640w"
test("img has loading=lazy, decoding=async, width/height from manifest")
test("priority sets loading=eager and fetchpriority=high")
test("unknown imageId renders placeholder with role=img and alt")    // không có <img src>
test("onError swaps to placeholder")                                 // fireEvent.error(img)
test("shows credit text in figcaption")
```

- [ ] **Step 3:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 4:** Cài đặt `SmartImage`: dùng `<picture>`; LQIP làm `background-image` cho tới khi `onLoad`; `aspect-ratio` lấy từ manifest. Placeholder dùng icon `ImageOff` của Lucide kèm chữ "Hình ảnh đang được cập nhật".
- [ ] **Step 5:** Chạy test. Kỳ vọng: PASS. Commit `feat: image optimization pipeline and SmartImage`.

---

### Task 4: Pipeline dữ liệu bản đồ

**Files:**
- Create: `scripts/build-geo.mjs`, `src/features/map/geo.ts`, `public/maps/*`, cập nhật `docs/DATA_SOURCES.md`
- Test: `src/features/map/geo.test.ts`

**Interfaces:**
- Consumes: D2, D3, D5 từ `docs/DECISIONS.md`; `regions.json` (ids).
- Produces:

```ts
export interface RegionFeatureProps { regionId: string; name: string }
export interface ProvinceFeatureProps { provinceId: string; name: string; regionId: string }
export type GeoResult<P> = { ok: true; data: FeatureCollection<Polygon | MultiPolygon, P> } | { ok: false; reason: "network" | "invalid" };
export function loadRegionsGeo(): Promise<GeoResult<RegionFeatureProps>>;          // fetch `${import.meta.env.BASE_URL}maps/regions.geojson`, cache
export function loadProvincesGeo(regionId: string): Promise<GeoResult<ProvinceFeatureProps>>;
export function isFeatureCollection<P>(raw: unknown, isProps: (p: unknown) => p is P): raw is FeatureCollection<Polygon | MultiPolygon, P>;
```

(Type `FeatureCollection` lấy từ `@types/geojson`.)

- [ ] **Step 1: Script.** Dùng `mapshaper` đọc ranh giới tỉnh gốc trong `raw/geo/` (WGS84). Gán `regionId` cho từng tỉnh theo bảng D2, dissolve thành `regions.geojson`. Đơn giản hóa (khởi đầu ~5%, giữ shape, `keep-shapes`). Làm tròn tọa độ 4 chữ số thập phân. Xuất `provinces/<regionId>.geojson` nếu D3 có dữ liệu, và `islands.geojson` cho Hoàng Sa, Trường Sa. Mục tiêu: `regions.geojson` < 150KB (chưa gzip).
- [ ] **Step 2:** Ghi `docs/DATA_SOURCES.md`: nguồn, phiên bản, ngày tham chiếu hành chính, CRS (EPSG:4326), license, mức đơn giản hóa, hạn chế đã biết.
- [ ] **Step 3: Viết test lỗi trước**

```ts
test("isFeatureCollection rejects missing regionId in properties")
test("loadRegionsGeo returns {ok:false, reason:'network'} when fetch rejects")
test("loadRegionsGeo returns {ok:false, reason:'invalid'} on non-GeoJSON body")
test("public/maps/regions.geojson: every regionId exists in regions.json")   // đọc file thật bằng fs
```

- [ ] **Step 4:** Cài đặt. Chạy test. Kỳ vọng: PASS. Commit `feat: geo data pipeline and loaders`.

---

### Task 5: Trang bản đồ: lớp vùng, chọn vùng, điều khiển

**Files:**
- Create: `src/features/map/{VietnamMap,RegionLayer,IslandLabels,MapControls,RegionList,MapInfoPanel}.tsx`, `src/features/map/useMapSelection.ts`, `src/pages/MapPage.tsx`
- Test: `src/features/map/MapPage.test.tsx` (mock `react-leaflet` bằng component đơn giản, giữ lại các handler)

**Interfaces:**
- Consumes: `loadRegionsGeo`, `getRegions`, `loadRegionContent`.
- Produces: `useMapSelection(): { regionId: string | null; provinceId: string | null; itemId: string | null; selectRegion(id: string | null): void; selectProvince(id: string | null): void; selectItem(id: string | null): void }`. `regionId` đồng bộ với route `/ban-do/:regionId`; đổi vùng thì reset `provinceId`/`itemId`.

- [ ] **Step 1: Viết test lỗi trước**

```tsx
test("RegionList shows all regions as buttons; coming_soon ones labelled 'Sắp ra mắt'")
test("clicking region button navigates to /ban-do/trung-du-mien-nui-bac-bo and panel shows region name + 5 topic links")
test("keyboard: Tab to region button, Enter selects it")
test("'Về bản đồ Việt Nam' clears selection and route returns to /ban-do")
test("geo load failure shows ErrorState 'Chưa tải được bản đồ' with retry, RegionList still usable")
test("map container has bounded height class and scrollWheelZoom=false")
```

- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt.
  - `VietnamMap` được lazy-import trong `MapPage`; Leaflet CSS import bên trong nó. `MapContainer` không có TileLayer, nền màu biển nhạt, `maxBounds` quanh Việt Nam + Biển Đông, `minZoom`/`maxZoom` cố định, `scrollWheelZoom={false}`, chiều cao `h-[55vh] lg:h-[calc(100vh-8rem)]`.
  - `RegionLayer`: một `<GeoJSON>` duy nhất, đặt `key` theo phiên bản dữ liệu. Style vùng chọn và hover cập nhật bằng `layer.setStyle` trong `useEffect` theo `regionId` (React Leaflet không áp lại prop `style` sau khi mount). Chọn vùng thì `map.fitBounds(layer.getBounds(), { padding })` và `bringToFront`.
  - `IslandLabels`: nhãn "Quần đảo Hoàng Sa", "Quần đảo Trường Sa", "Biển Đông".
  - `MapControls`: phóng to, thu nhỏ, "Về bản đồ Việt Nam"; mỗi nút có icon + chữ + `aria-label`.
  - Layout desktop: chia 2 cột (trái: bản đồ + `RegionList`; phải: `MapInfoPanel`). Màn hình hẹp chỉ cần xếp dọc, không tối ưu thêm (Task 13).
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS. Commit `feat: interactive region map`.

---

### Task 6: Lớp tỉnh, marker địa danh, popup

**Files:**
- Create: `src/features/map/{ProvinceLayer,LocationMarkers}.tsx`
- Modify: `src/features/map/VietnamMap.tsx`, `MapInfoPanel.tsx`
- Test: `src/features/map/markers.test.tsx`

**Interfaces:**
- Consumes: `useMapSelection`, `loadProvincesGeo`, `RegionContent.items`.

- [ ] **Step 1: Viết test lỗi trước**

```tsx
test("markers render only for published items with location in selected region")
test("category filter in panel limits markers to that category")
test("popup shows title, category label, thumbnail and link 'Xem chi tiết' to /dia-danh/:id")
test("selecting a province filters panel list to items with that provinceId")
test("province data unavailable → no province layer, panel note 'Bản đồ tỉnh đang được cập nhật'")
```

- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt. Marker là `divIcon`, màu và icon theo category (Lucide → SVG string). Chỉ render khi đã chọn vùng. Popup dùng `SmartImage` cỡ 320. Thứ tự lớp: tỉnh nằm trên vùng, marker nằm trên cùng.
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS. Commit `feat: province layer and location markers`.

---

### Task 7: Trang vùng (tab chủ đề) và trang địa danh

**Files:**
- Create: `src/components/ui/Tabs.tsx`, `src/features/content/components/{TopicTabs,ContentCard,ItemDetail,AudioPlayer}.tsx`, `src/pages/{RegionPage,ItemPage}.tsx`
- Test: `src/features/content/pages.test.tsx`

- [ ] **Step 1: Viết test lỗi trước**

```tsx
test("RegionPage shows intro and 5 tabs with TOPIC_LABELS; arrow keys move between tabs (WAI-ARIA tabs)")
test("tab ?chu-de=mineral is selected from URL query")
test("empty category shows EmptyState 'Nội dung đang được cập nhật'")
test("ItemPage shows title, location placeName, highlights, keyPoints under heading 'Ghi nhớ', related items, 'Về bản đồ' link to /ban-do/:regionId")
test("ItemPage without location hides the location row")
test("audio error hides player and shows 'Chưa nghe được thuyết minh' without breaking page")
test("unknown itemId shows NotFound state with link to /ban-do")
test("visiting ItemPage calls markItemViewed(itemId)")
```

- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt. Phần "Ghi nhớ" hiển thị dạng danh sách có icon. Ảnh đầu tiên làm `priority`, phần còn lại lazy. Các mục liên quan hiện dạng `ContentCard`. Hiệu ứng nhẹ (fade/translate 150–200ms) và tắt khi người dùng bật reduced-motion.
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS. Commit `feat: region and item detail pages`.

---

### Task 8: Lưu tiến độ học tập

**Files:**
- Create: `src/lib/storage.ts`, `src/features/progress/{progress.ts,ProgressProvider.tsx,useProgress.ts}`, `src/pages/ProgressPage.tsx`
- Modify: `src/app/App.tsx` (bọc Provider)
- Test: `src/features/progress/progress.test.ts`, `src/pages/ProgressPage.test.tsx`

**Interfaces:**

```ts
export interface QuizRecord { lastScore: number; bestScore: number; total: number; attempts: number; completedAt: string } // ISO
export interface ProgressState { version: 1; visitedRegionIds: string[]; viewedItemIds: string[]; recentItemIds: string[]; quizzes: Record<string, QuizRecord> }
export const INITIAL_PROGRESS: ProgressState;
export function parseProgress(raw: string | null): ProgressState;           // hỏng hoặc sai version → INITIAL_PROGRESS
export function markRegionVisited(s: ProgressState, id: string): ProgressState;  // trả về chính s nếu không đổi
export function markItemViewed(s: ProgressState, id: string): ProgressState;     // recentItemIds tối đa 6, mới nhất trước
export function recordQuiz(s: ProgressState, quizId: string, score: number, total: number, now: Date): ProgressState;
export function regionCompletion(s: ProgressState, c: RegionContent): number;   // 0–100
// storage.ts
export function safeGet(key: string): string | null;  // try/catch, null nếu bị chặn
export function safeSet(key: string, value: string): boolean;
export function safeRemove(key: string): void;
// useProgress()
{ state: ProgressState; markRegionVisited(id): void; markItemViewed(id): void; recordQuiz(id, score, total): void; reset(): void; persisted: boolean }
```

Công thức `regionCompletion` = round(100 × (số mục published đã xem + số quiz published đã hoàn thành) / (tổng mục published + tổng quiz published)); bằng 0 nếu mẫu số bằng 0.

- [ ] **Step 1: Viết test lỗi trước**

```ts
test("parseProgress(null) and parseProgress('{bad') return INITIAL_PROGRESS")
test("parseProgress with version 2 returns INITIAL_PROGRESS")
test("markItemViewed twice returns same reference (no redundant write)")
test("recordQuiz keeps bestScore = max, increments attempts")
test("regionCompletion ignores draft items and handles 0 denominator")
test("safeSet returns false when localStorage.setItem throws; app state still updates")
test("ProgressPage reset asks confirmation dialog, then clears; cancel keeps data")
test("ProgressPage shows note 'Tiến độ chỉ lưu trên trình duyệt này'")
```

- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt. Provider chỉ ghi khi reference của state thay đổi. Hộp xác nhận reset là `<dialog>` tự làm, không dùng `window.confirm`. Nếu `persisted === false`, hiện banner "Trình duyệt đang chặn lưu tiến độ".
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS. Commit `feat: local learning progress`.

---

### Task 9: Engine trắc nghiệm, câu một đáp án và Đúng/Sai

**Files:**
- Create: `src/features/quiz/{engine.ts,registry.tsx,QuizRunner.tsx,QuizResult.tsx}`, `src/features/quiz/questions/{SingleChoice,TrueFalse}.tsx`, `src/pages/{QuizListPage,QuizPage}.tsx`
- Test: `src/features/quiz/engine.test.ts`, `src/features/quiz/QuizRunner.test.tsx`

**Interfaces:**

```ts
export type Answer =
  | { type: "single_choice"; index: number } | { type: "true_false"; value: boolean }
  | { type: "map_locate"; itemId: string } | { type: "matching"; pairs: Record<number, number> }; // leftIndex → rightIndex
export function isCorrect(q: Question, a: Answer): boolean;       // type khác nhau → false
export function score(qs: Question[], answers: (Answer | undefined)[]): { correct: number; total: number };
export function shuffle<T>(xs: readonly T[], rand?: () => number): T[]; // chỉ xáo cột phải của matching
export interface QuestionViewProps<Q extends Question> { question: Q; answer?: Answer; onAnswer(a: Answer): void; locked: boolean }
export const questionViews: { [K in Question["type"]]: ComponentType<QuestionViewProps<Extract<Question, { type: K }>>> };
```

Thêm dạng trò chơi mới = thêm một nhánh vào union, một case trong `isCorrect`, một view trong `questionViews`. TypeScript sẽ báo lỗi nếu thiếu.

Lời phản hồi cố định: đúng là "Chính xác! Em đã trả lời đúng."; sai là "Em hãy cùng tìm hiểu lại nội dung này nhé!", kèm đáp án đúng và `explanation`.

- [ ] **Step 1: Viết test lỗi trước**

```ts
test("isCorrect single_choice / true_false / mismatched type")
test("score counts unanswered as wrong")
test("QuizRunner: answer locks options, shows feedback text + explanation, 'Câu tiếp theo' advances; progress 'Câu 2/8'")
test("result screen shows 'Em đúng 6/8 câu', calls recordQuiz once, 'Chơi lại' resets to câu 1")
test("'Xem lại câu sai' lists only wrong questions with correct answer")
test("draft questions excluded in PROD; quiz with 0 published questions shows EmptyState")
test("unknown quizId shows NotFound")
```

- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt. Hiệu ứng khi trả lời: đúng thì viền xanh + icon `CheckCircle2` scale nhẹ; sai thì viền cam (không dùng đỏ gắt) + icon `Lightbulb`. Feedback đặt trong `aria-live="polite"`.
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS. Commit `feat: quiz engine with single choice and true/false`.

---

### Task 10: Dạng "Xác định trên bản đồ" và "Ghép đôi"

**Files:**
- Create: `src/features/quiz/questions/{MapLocate,Matching}.tsx`
- Modify: `src/features/quiz/{engine.ts,registry.tsx}`
- Test: `src/features/quiz/questions/advanced.test.tsx`

- [ ] **Step 1: Viết test lỗi trước**

```tsx
test("isCorrect map_locate / matching (all pairs must match)")
test("MapLocate: clicking candidate marker answers; also selectable via button list (keyboard)")
test("Matching: tap left then right pairs them; tap a paired item to undo; 'Kiểm tra' enabled only when all paired")
test("Matching works with keyboard only (Tab + Enter)")
```

- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Cài đặt. `MapLocate` dùng lại `VietnamMap` ở chế độ thu gọn (lazy), chỉ hiện các marker `candidateItemIds`, không hiện tên trên marker. Danh sách nút thay thế dùng nhãn "Điểm A/B/C". `Matching` dùng kiểu chạm–chạm (không kéo–thả, tốt cho bảng thông minh và điện thoại); mỗi cặp đã ghép có màu riêng.
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS. Commit `feat: map locate and matching games`.

---

### Task 11: Trang chủ và hoàn thiện UI

**Files:**
- Modify: `src/pages/HomePage.tsx`, các component UI
- Test: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Viết test lỗi trước**

```tsx
test("hero has title, subtitle, primary 'Khám phá bản đồ' → /ban-do, secondary 'Thử tài kiến thức' → /on-tap")
test("featured region card links to /ban-do/trung-du-mien-nui-bac-bo")
test("progress summary shows regionCompletion % and links to /tien-do")
```

- [ ] **Step 2:** Cài đặt theo ảnh tham khảo (D8). Ảnh hero dùng `priority`. Kiểm tra thủ công ở desktop 1280px và 1920px, cùng chế độ trình chiếu (zoom trình duyệt 125–150%).
- [ ] **Step 3:** Chạy test. Kỳ vọng: PASS. Commit `feat: home page and UI polish`.

---

### Task 12: Tối ưu, build, deploy, báo cáo

**Files:**
- Create: `vercel.json`, `public/_redirects`, `README.md`, `docs/DEPLOY.md`, `scripts/check-dist.mjs`
- Modify: `index.html` (`lang="vi"`, title, meta description, favicon, OG), `vite.config.ts`

- [ ] **Step 1:** Thêm `vercel.json` với rewrite `/(.*)` → `/index.html`; `public/_redirects` với `/* /index.html 200`. `base` lấy từ env `VITE_BASE` (mặc định `/`).
- [ ] **Step 2:** `scripts/check-dist.mjs` kiểm tra:
  - `dist/index.html` và `dist/_redirects` tồn tại.
  - Chunk JS ban đầu (entry) < 150KB gzip.
  - `leaflet` không có trong entry chunk.
  - Không có ảnh trong `dist/images` > 250KB.

  Gắn vào script `npm run verify` = `typecheck && lint && test && build && node scripts/check-dist.mjs`.
- [ ] **Step 3:** Chạy `npm run verify`. Kỳ vọng: tất cả PASS.
- [ ] **Step 4:** `npm run preview`. Mở trực tiếp `/dia-danh/<id>` và refresh; kiểm tra tab Network (ảnh AVIF, chỉ ảnh trong viewport mới tải). Chạy Lighthouse desktop: Performance ≥ 90, Accessibility ≥ 95. Ghi số liệu vào README.
- [ ] **Step 5:** README: cách chạy, thêm nội dung/ảnh/bản đồ, danh sách **đã xong / còn hạn chế** (nội dung còn draft, dữ liệu còn thiếu). Commit `chore: production build and deploy config`.

---

### Task 13 (giai đoạn sau): Tối ưu tablet và điện thoại

Làm sau khi MVP desktop đã ổn định và được duyệt.

- [ ] **Step 1:** Rà lại layout ở 375, 768 và 1024px cho mọi trang; menu ☰ có target chạm ≥ 44px.
- [ ] **Step 2:** Bản đồ trên mobile: chiều cao khoảng 55vh, kéo bằng một ngón thì cuộn trang, dùng hai ngón để di chuyển bản đồ; thông tin vùng hiện bên dưới bản đồ hoặc trong bottom sheet.
- [ ] **Step 3:** Thêm test: trên viewport hẹp, panel thông tin nằm sau bản đồ trong DOM, và các nút không bị tràn.
- [ ] **Step 4:** Chạy Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95. Commit `feat: tablet and mobile optimization`.
