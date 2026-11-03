# Thư viện ảnh nhúng theo tỉnh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi tỉnh có bộ ảnh minh hoạ cho văn hoá, phong tục, khoáng sản, danh lam thắng cảnh. Ảnh lưu dạng JSON, **nhúng thẳng từ trang gốc** (không chép file ảnh vào repo hay server). Mỗi ảnh hiện đủ tác giả, giấy phép và link về trang gốc.

**Architecture:**
- Thư viện ảnh tách riêng khỏi nội dung SGK, đặt tại `src/data/images/<regionId>/<provinceId>.json`. Ảnh nói về cả vùng thì đặt trong `_toan-vung.json`.
- Mỗi ảnh gắn với `provinceId`, `category` (một trong 5 chủ đề) và tuỳ chọn `itemIds` (mục nội dung mà ảnh minh hoạ).
- Metadata ghi nguồn (tác giả, giấy phép, link) **không gõ tay**. Script `scripts/commons-fetch.mjs` đọc danh sách ảnh đã chọn, gọi API Wikimedia Commons lấy metadata rồi sinh JSON.
- Lúc chạy web chỉ có thẻ `<img>` trỏ tới `upload.wikimedia.org`, không gọi API nào. Bản web không tốn dung lượng lưu ảnh.
- Parser và test toàn vẹn chặn ảnh sai giấy phép, sai host hoặc tham chiếu tỉnh/mục không tồn tại.

**Tech Stack:** Hệ hiện có (React 19, TS strict, Vite, Tailwind v4, Vitest + RTL). Script Node thuần (`fetch` có sẵn trong Node 18+), không thêm thư viện.

**Spec:** Yêu cầu của người dùng ngày 2026-11-03 (trích): *"tìm các hình ảnh liên quan đến văn hóa, phong tục, khoáng sản, danh lam thắng cảnh của từng tỉnh và tổng hợp thành dạng json; vì web này deploy trên server free nên cấu hình hạn chế, cần nhúng hình của web khác vào; khi nhúng các hình này vào cần ghi nguồn và gắn ref lại trang web gốc để tôn trọng quyền tác giả"*. Các quyết định thiết kế bên dưới là phần diễn giải spec. Người dùng duyệt plan là duyệt các quyết định này.

## Quyết định thiết kế (cần người dùng xác nhận khi duyệt plan)

1. **Nguồn ảnh chỉ lấy từ Wikimedia Commons.**
   - Ghi nguồn không làm cho việc nhúng ảnh có bản quyền trở nên hợp pháp. Ảnh trên báo, blog, trang du lịch phần lớn "giữ mọi quyền", và nhiều trang còn chặn nhúng (hotlink protection), nên ảnh sẽ vỡ.
   - Commons chỉ nhận ảnh có giấy phép tự do, cho phép nhúng trực tiếp từ `upload.wikimedia.org`, và có API trả sẵn tác giả và giấy phép.
   - Schema có trường `provider` để sau này thêm nguồn tự do khác (Flickr CC, ảnh do giáo viên tự chụp) mà không đổi cấu trúc.
2. **Danh sách giấy phép được chấp nhận:**
   - Được nhận: Public domain, CC0, CC BY *, CC BY-SA *.
   - Bị loại: NC (phi thương mại), ND (không phái sinh), "Fair use" và mọi giấy phép khác.
   - Lý do loại NC/ND: để không bao giờ phải cân nhắc từng trường hợp. Web có dùng thumbnail, mà thumbnail là bản thu nhỏ.
3. **Ghi nguồn theo chuẩn TASL** (Title, Author, Source, License) ngay dưới mỗi ảnh:
   - Mẫu: "Ảnh: ‹Tác giả›, ‹Giấy phép›, qua Wikimedia Commons".
   - Tác giả, giấy phép và chữ "Wikimedia Commons" đều là link mở tab mới, lần lượt tới trang tác giả (nếu có), trang giấy phép và trang `File:` gốc.
   - Có thêm trang **/nguon-anh** liệt kê toàn bộ ảnh đang dùng.
4. **Phạm vi đợt này:** 9 tỉnh của vùng Trung du và miền núi phía Bắc, vì đây là vùng đã có nội dung.
   - Schema và script dùng được cho cả 34 tỉnh. Các vùng khác làm khi vùng đó mở nội dung.
5. **Không bịa:**
   - Chú thích tiếng Việt chỉ được viết từ mô tả gốc trên Commons, sau khi đã **xem ảnh và xác nhận đúng chủ thể**. Không suy đoán địa điểm khi Commons không ghi.
   - Mọi ảnh vào với `status: "draft"`. Ảnh nháp chỉ hiện ở dev và bản xem thử (`VITE_SHOW_DRAFTS`), giống quy tắc của nội dung.
   - Tỉnh hoặc chủ đề không tìm được ảnh hợp lệ thì để trống và ghi vào `docs/IMAGE_GAPS.md`. Không lấy ảnh "na ná" để lấp chỗ.
6. **Tên tỉnh mới (sau sắp xếp 2025):** ảnh Commons ghi tên tỉnh cũ (ví dụ "Hà Giang", "Yên Bái") được gán vào tỉnh mới đã sáp nhập (Tuyên Quang, Lào Cai). Chú thích ghi tên tỉnh mới, có thể kèm "(trước đây thuộc tỉnh …)" nếu Commons ghi tỉnh cũ.

## Global Constraints

- Không commit file ảnh cho thư viện này. Chỉ có JSON và link.
- `src.*` phải là `https://upload.wikimedia.org/wikipedia/commons/...`.
- `sourceUrl` phải là `https://commons.wikimedia.org/wiki/File:...`.
- `license` phải khớp danh sách ở Quyết định 2. Mỗi ảnh bắt buộc có `author`, `license`, `licenseUrl` (trừ Public domain), `sourceUrl`.
- `category` là một trong `TOPIC_CATEGORIES` hiện có. "Phong tục" thuộc `culture` (nhãn "Lễ hội và văn hóa").
- `provinceId` phải có trong `src/data/provinces.json` và thuộc đúng vùng của thư mục chứa file.
- `itemIds` (nếu có) phải tồn tại trong nội dung của vùng đó.
- Ảnh nháp (`draft`) bị lọc ở PROD theo `isPublished` hiện có.
- `<img>` phải có `width`/`height` (tránh nhảy layout), `loading="lazy"` (trừ ảnh đầu), `alt` tiếng Việt, và `referrerPolicy="no-referrer"`.
- UI tiếng Việt, identifier tiếng Anh. Code theo style hiện có: nháy đơn, không chấm phẩy, không chạy prettier mặc định.

## Review Focus

1. **Ảnh bị xoá hoặc đổi tên trên Commons** (link 404): khung ảnh hiện "Hình ảnh hiện không tải được", **dòng ghi nguồn và link vẫn còn**, layout không nhảy. Test ở Task 5.
2. **Trường `Artist` của Commons chứa HTML** (link, `<span>`, chữ ký nhiều dòng): JSON chỉ chứa text sạch cùng `authorUrl` tách riêng, không bao giờ render HTML thô. Test ở Task 3.
3. **Giấy phép lạ** ("CC BY-NC-SA 2.0", "Attribution", "GFDL" đứng một mình, chuỗi rỗng): script bỏ qua ảnh đó và báo lý do, parser ném `ContentError`. Test ở Task 1 và Task 3.
4. **Ảnh nói về cả vùng** (không thuộc tỉnh nào) và tỉnh chưa có ảnh: card tỉnh không hiện khung ảnh rỗng, modal không hiện tiêu đề "Hình ảnh" khi không có ảnh. Test ở Task 6.
5. **Ảnh quá dọc hoặc panorama quá ngang** làm vỡ lưới: khung hiển thị khoá tỉ lệ 4:3 với `object-cover`, còn ở lightbox/trang nguồn thì hiện nguyên tỉ lệ. Test ở Task 5.

---

### Task 1: Kiểu dữ liệu và parser cho ảnh nhúng

**Files:**
- Modify: `src/types/content.ts` (thêm `WebImage`)
- Create: `src/features/images/parseWebImages.ts`
- Test: `src/features/images/parseWebImages.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const ALLOWED_LICENSE = /^(Public domain|CC0( 1\.0)?|CC BY(-SA)? \d\.\d( [A-Za-z-]+)?)$/
  export interface WebImage {
    id: string                 // "<provinceId|_toan-vung>__<slug>", duy nhất toàn site
    provider: 'wikimedia-commons'
    regionId: string           // gắn từ đường dẫn thư mục, không ghi trong JSON
    provinceId: string | null  // null = ảnh của cả vùng (_toan-vung.json)
    category: TopicCategory
    itemIds: string[]
    alt: string                // tiếng Việt, mô tả cái nhìn thấy
    caption: string            // tiếng Việt, 1 câu, từ mô tả Commons
    src: { url: string; width: number; height: number; srcset: { url: string; width: number }[] }
    attribution: { title: string; author: string; authorUrl?: string; license: string; licenseUrl?: string; sourceUrl: string }
    status: ContentStatus
  }
  export function parseWebImages(raw: unknown, regionId: string, fileProvinceId: string | null, path: string): WebImage[]
  ```

- [ ] **Step 1: Viết test lỗi** trong `parseWebImages.test.ts`, mỗi test một hành vi:
  - `parses a valid commons image` → trả về 1 phần tử, `regionId` lấy từ tham số, `provinceId === 'lao-cai'`.
  - `rejects non-commons src host` (`https://example.com/a.jpg`) → `ContentError`, path `…[0].src.url`.
  - `rejects sourceUrl that is not a commons File page` → `ContentError`, path `…[0].attribution.sourceUrl`.
  - `rejects NC / ND / empty licenses`: duyệt `['CC BY-NC-SA 2.0','CC BY-ND 4.0','']` → mỗi giá trị ném lỗi.
  - `accepts PD, CC0, CC BY 2.0, CC BY-SA 4.0, CC BY-SA 3.0 igo`.
  - `requires licenseUrl unless Public domain`.
  - `provinceId in JSON must equal the file's province` (`lao-cai.json` chứa `"provinceId": "phu-tho"` → lỗi). Riêng `_toan-vung.json` bắt buộc `provinceId: null`.
  - `category must be a topic category`.
- [ ] **Step 2:** `npx vitest run src/features/images` → FAIL vì `parseWebImages` chưa có.
- [ ] **Step 3: Cài đặt** `parseWebImages`, dùng lại các helper `obj/str/list/oneOf/ContentError` của `src/features/content/parse.ts` (export các helper cần thiết, không chép lại).
- [ ] **Step 4:** Chạy lại → PASS; `npm run typecheck` sạch.
- [ ] **Step 5: Commit** `feat(images): WebImage type and strict parser (commons host + license allowlist)`.

### Task 2: Nạp thư viện ảnh và kiểm tra toàn vẹn

**Files:**
- Create: `src/features/images/library.ts`, `src/data/images/trung-du-mien-nui-phia-bac/_toan-vung.json` (`[]`)
- Modify: `src/features/content/integrity.test.ts` (thêm khối kiểm tra ảnh trên dữ liệu thật)
- Test: `src/features/images/library.test.ts`

**Interfaces:**
- Consumes: `parseWebImages` (Task 1), `isPublished` (`src/features/content/repository.ts`), `provinces.json`.
- Produces:
  ```ts
  export interface ImageLibrary {
    loadRegion(regionId: string): Promise<WebImage[]>        // đã lọc isPublished, cache theo vùng
    forItem(images: WebImage[], itemId: string): WebImage[]
    forProvince(images: WebImage[], provinceId: string): WebImage[]
    regionCover(images: WebImage[]): WebImage | undefined   // landmark đầu tiên, rồi natural
  }
  export function createImageLibrary(loaders: Record<string, () => Promise<unknown>>): ImageLibrary
  export const imageLibrary: ImageLibrary                    // từ import.meta.glob('../../data/images/**/*.json')
  export function checkImageIntegrity(images: WebImage[], contents: RegionContent[], provinces: {id:string; regionId:string}[]): string[]
  ```
  Tên file quyết định `provinceId` (`_toan-vung` → `null`), thư mục quyết định `regionId`, giống cơ chế `regionFiles.ts`.

- [ ] **Step 1: Test lỗi:**
  - `loadRegion merges province files and region-wide file`: 2 loader giả → 3 ảnh, thứ tự theo `provinces.json`, `_toan-vung` cuối.
  - `drafts are hidden in PROD`, `shown with VITE_SHOW_DRAFTS` (dùng `vi.stubEnv` như `repository.test.ts`).
  - `forItem` và `forProvince` lọc đúng.
  - `regionCover prefers landmark`.
  - `checkImageIntegrity` báo: tỉnh không thuộc vùng, `itemIds` không tồn tại, `id` trùng.
  - Test dữ liệu thật trong `integrity.test.ts`: `checkImageIntegrity(...)` trả về `[]`.
- [ ] **Step 2:** Chạy → FAIL.
- [ ] **Step 3:** Cài đặt `library.ts`.
- [ ] **Step 4:** Chạy → PASS, cả bộ `npm test` xanh.
- [ ] **Step 5: Commit** `feat(images): per-region image library loader + integrity check`.

### Task 3: Script lấy metadata từ Wikimedia Commons

**Files:**
- Create: `scripts/commons-fetch.mjs`, `scripts/lib/commons.mjs` (hàm thuần), `image-picks/trung-du-mien-nui-phia-bac.json`
- Test: `scripts/lib/commons.test.mjs` (Vitest chạy được file `.mjs`; nếu cần thì thêm `scripts/**/*.test.mjs` vào `include` của vitest config)
- Modify: `package.json` (thêm `"images:fetch": "node scripts/commons-fetch.mjs"`)

**Interfaces:**
- Input `image-picks/<regionId>.json` (người chọn ảnh viết tay, là nguồn gốc của dữ liệu):
  ```json
  [{ "file": "File:Fansipan summit new.jpg", "provinceId": "lao-cai", "category": "landmark",
     "itemIds": ["trung-du-mien-nui-phia-bac__dinh-phan-xi-pang"],
     "alt": "Chóp đỉnh Phan-xi-păng giữa mây", "caption": "Đỉnh Phan-xi-păng (tỉnh Lào Cai).",
     "checked": "2026-11-03: đã xem ảnh, đúng chủ thể" }]
  ```
- Produces (hàm thuần, export từ `scripts/lib/commons.mjs`):
  - `apiUrl(titles: string[]): string`: một lần gọi `action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=960&format=json&origin=*` cho tối đa 50 file.
  - `cleanArtist(html: string): { author: string; authorUrl?: string }`: bỏ thẻ, gộp khoảng trắng, lấy `href` đầu tiên (đổi `//` thành `https://`).
  - `normalizeLicense(shortName: string): string | null`: trả `null` nếu không thuộc danh sách cho phép.
  - `thumbSet(thumbUrl: string, origWidth: number): {url;width}[]`: các bậc 500, 960, 1280 không vượt ảnh gốc, thay `/960px-` trong thumburl.
  - `toWebImage(pick, page): { image?: object; skip?: string }`.
- Hành vi CLI: `node scripts/commons-fetch.mjs <regionId>`
  - Gom ảnh theo `provinceId`, ghi `src/data/images/<regionId>/<provinceId|_toan-vung>.json` với `status: "draft"`. Ghi đè trạng thái `verified` cũ nếu metadata không đổi.
  - In bảng ảnh bị bỏ qua kèm lý do.
  - Gửi header `User-Agent: em-kham-pha-lsdl/1.0 (https://em-kham-pha-lsdl.vercel.app; educational)` theo quy định API của Wikimedia.
  - Nghỉ 1 giây giữa các lô, thử lại khi gặp 429.

- [ ] **Step 1: Test lỗi** với fixture JSON thật của API (lưu sẵn 2 trang mẫu trong `scripts/lib/__fixtures__/`):
  - `cleanArtist('<a href="//commons.wikimedia.org/wiki/User:X">X</a> (talk)')` → `{author:'X (talk)', authorUrl:'https://commons.wikimedia.org/wiki/User:X'}`.
  - `normalizeLicense('CC BY-SA 4.0')==='CC BY-SA 4.0'`, `normalizeLicense('CC BY-NC 2.0')===null`, `normalizeLicense('Public domain')==='Public domain'`, `normalizeLicense('pd')==='Public domain'`.
  - `thumbSet(url, 800)` → chỉ có 500 (và 800 là ảnh gốc).
  - `toWebImage` với page thiếu `imageinfo` → `skip: 'file không tồn tại'`.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Cài đặt các hàm thuần và CLI mỏng.
- [ ] **Step 4:** PASS. Chạy thử thật với 2 ảnh Phan-xi-păng và Đền Hùng. Mở `src.url` trên trình duyệt để xác nhận trả về 200. Kết quả phải qua `parseWebImages`.
- [ ] **Step 5: Commit** `feat(images): commons metadata fetch script (no hand-typed credits)`.

### Task 4: Tuyển chọn ảnh cho 9 tỉnh (task dữ liệu)

**Files:**
- Modify: `image-picks/trung-du-mien-nui-phia-bac.json`
- Create: `docs/IMAGE_GAPS.md`
- Generated: `src/data/images/trung-du-mien-nui-phia-bac/*.json`

**Quy trình cho mỗi tỉnh** (Lai Châu, Điện Biên, Sơn La, Lào Cai, Tuyên Quang, Cao Bằng, Thái Nguyên, Lạng Sơn, Phú Thọ) × chủ đề (`culture` gồm lễ hội, phong tục, trang phục, chợ phiên; `mineral`; `landmark`; thêm `historical_site` khi SGK có):

1. Tìm trên Commons theo tên tỉnh mới và **tên tỉnh cũ đã sáp nhập**, theo category Commons của tỉnh, và theo tên địa danh mà SGK nhắc tới. Ưu tiên ảnh minh hoạ trực tiếp cho các mục SGK đã có (Phan-xi-păng, Hoàng Liên Sơn, Mù Cang Chải, Lũng Cú, Đền Hùng, thuỷ điện Sơn La, Thác Bà, chợ phiên Bắc Hà, người Mông, Xoè Thái…). Danh sách ứng viên cũ nằm trong scratchpad `image-candidates.md`.
2. **Xem ảnh** (thumbnail) và xác nhận đúng chủ thể. Ghi `checked`.
3. Viết `alt` (thấy gì) và `caption` (một câu, lấy từ mô tả Commons). Không thêm năm, số liệu hay tên địa điểm mà Commons và SGK không ghi.
4. Mục tiêu 2–4 ảnh mỗi ô tỉnh × chủ đề. Không đạt thì ghi vào `IMAGE_GAPS.md` (tỉnh, chủ đề, đã tìm những gì).

- [ ] **Step 1:** Tuyển ảnh theo quy trình trên cho 9 tỉnh. Mỗi tỉnh xong thì commit một lần (`data(images): <tỉnh>`).
- [ ] **Step 2:** `npm run images:fetch trung-du-mien-nui-phia-bac`. Bảng ảnh bị bỏ qua phải rỗng, hoặc mỗi dòng đã được xử lý (thay ảnh hoặc ghi vào GAPS).
- [ ] **Step 3:** `npm test` (integrity dữ liệu thật) → xanh.
- [ ] **Step 4: Commit** `data(images): commons picks for 9 provinces of TDMNPB (draft)`.

### Task 5: Component `WebImageFigure`

**Files:**
- Create: `src/components/ui/WebImageFigure.tsx`, `src/components/ui/ImageCredit.tsx`
- Test: `src/components/ui/WebImageFigure.test.tsx`

**Interfaces:**
- Produces:
  - `WebImageFigure({ image, sizes, priority?, className?, showCaption? })`: `<figure>`, khung tỉ lệ 4:3 dùng `object-cover`, `<img srcSet sizes width height loading referrerPolicy="no-referrer">`.
  - `ImageCredit({ image })`: dòng TASL. Tác giả là link khi có `authorUrl`. Giấy phép là link khi có `licenseUrl`. "Wikimedia Commons" là link tới `sourceUrl`. Mọi link có `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 1: Test lỗi:**
  - `renders img with commons srcset, alt, width/height, lazy`.
  - `credit links to source page, license and author` (kiểm tra `href` của 3 link; tên link: tên tác giả, tên giấy phép, "Wikimedia Commons").
  - `author without url is plain text`.
  - `on load error shows fallback text but keeps the credit links` (`fireEvent.error(img)` → có chữ "Hình ảnh hiện không tải được", link nguồn vẫn còn).
  - `frame keeps 4:3 aspect for a panorama` (style `aspect-ratio: 4 / 3`).
- [ ] **Step 2:** FAIL. **Step 3:** cài đặt. **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat(ui): WebImageFigure with TASL credit and broken-link fallback`.

### Task 6: Gắn ảnh vào giao diện

**Files:**
- Create: `src/features/images/useRegionImages.ts` (hook giống `useRegionContent`)
- Modify:
  - `src/features/content/ItemDetail.tsx`: section "Hình ảnh" dùng `forItem`, đặt trên "Hình minh hoạ trong SGK".
  - `src/features/content/TopicModal.tsx`: truyền ảnh xuống.
  - `src/features/map/MapInfoPanel.tsx`:
    - Ảnh bìa vùng lấy từ `regionCover`.
    - Thẻ "Một số địa điểm tiêu biểu" lấy ảnh đầu của `forItem`.
    - `ProvinceCard` có dải 3–6 ảnh của tỉnh, nhóm theo chủ đề.
  - `src/pages/MapPage.tsx`: nạp ảnh theo vùng.
- Test: `src/pages/MapPage.test.tsx`, `src/features/content/TopicModal.test.tsx`

**Interfaces:**
- Consumes: `imageLibrary`, `WebImageFigure` (Task 2 và Task 5).
- Ảnh SGK (deep-link thẻ hình) vẫn giữ nguyên. Ảnh Commons là phần bổ sung.

- [ ] **Step 1: Test lỗi** (mock `imageLibrary` bằng `vi.mock`, dữ liệu 2 ảnh):
  - `modal shows images of the item with credit`: `region` "Hình ảnh" có 1 `img` và link "Wikimedia Commons".
  - `modal hides image section when item has none`.
  - `province card shows province images; none → no empty gallery`.
  - `featured place card uses item image`.
  - `region header uses cover image`.
- [ ] **Step 2:** FAIL. **Step 3:** cài đặt. **Step 4:** PASS, cả bộ xanh. Kiểm tra trên Chrome ở 1280px và 1512px.
- [ ] **Step 5: Commit** `feat: show commons images in modal, province card, featured places, region cover`.

### Task 7: Trang "Nguồn ảnh" và tài liệu

**Files:**
- Create: `src/pages/ImageCreditsPage.tsx`, test `src/pages/ImageCreditsPage.test.tsx`
- Modify:
  - `src/app/router.tsx`: route `nguon-anh`.
  - `src/components/layout/AppLayout.tsx`: link "Nguồn ảnh" ở footer.
  - `docs/DATA_SOURCES.md`, `docs/CONTENT_GUIDE.md`, `docs/DECISIONS.md`.
- Create: `scripts/commons-check.mjs` cùng script `"images:check"`. Script gửi HEAD tới mọi `src.url` và `sourceUrl`, rồi in các link hỏng. Chạy tay trước mỗi lần deploy.

- [ ] **Step 1: Test lỗi:**
  - `/nguon-anh` có h1 "Nguồn ảnh".
  - Bảng gồm cột Ảnh / Tỉnh / Tác giả / Giấy phép / Trang gốc, mỗi dòng có link `sourceUrl`.
  - Footer có link `/nguon-anh`.
- [ ] **Step 2:** FAIL. **Step 3:** cài đặt và viết tài liệu:
  - Quy trình 4 bước: chọn ảnh, viết picks, chạy `images:fetch`, xem lại.
  - Danh sách giấy phép được nhận.
  - Lý do không nhúng ảnh từ báo hoặc trang du lịch.
  - Cách xử lý link hỏng.
- [ ] **Step 4:** PASS, `npm test`, `npm run typecheck`, `npm run build` sạch. Chạy `npm run images:check` → 0 link hỏng.
- [ ] **Step 5: Commit** `feat: image credits page, link checker, docs`.

---

## Ngoài phạm vi (ghi lại để không làm lẫn)

- Lightbox phóng to ảnh: làm sau nếu cần.
- 25 tỉnh của 3 vùng còn lại: chạy lại Task 4 khi vùng đó có nội dung.
- Thay ảnh minh hoạ SGK bằng ảnh Commons: không làm. Thẻ "Hình minh hoạ trong SGK" giữ nguyên vì đó là đối chiếu sách.
