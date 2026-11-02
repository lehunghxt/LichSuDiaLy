# Hướng dẫn soạn nội dung

Nội dung học tập nằm trong `src/data/`. Không viết nội dung trong file `.tsx`.

| File | Nội dung |
|---|---|
| `src/data/regions.json` | Danh sách vùng: `id`, `name`, `shortName`, `color` (token màu), `status` (`active` hoặc `coming_soon`) |
| `src/data/regions/<regionId>.json` | Nội dung của một vùng: `region`, `intro`, `items`, `quizzes`. Tên file phải trùng `region.id` |
| `src/data/image-manifest.json` | Sinh tự động bằng `npm run images`, **không sửa tay** |

## Quy ước id

- Id viết chữ thường, không dấu, nối bằng `-`.
- Id của địa danh và bài ôn tập có dạng `<regionId>__<slug>` (hai dấu gạch dưới), ví dụ `trung-du-mien-nui-bac-bo__sa-pa`.
- Id câu hỏi chỉ cần duy nhất trong bài, ví dụ `q1`.

## Một mục nội dung (`items[]`)

```json
{
  "id": "trung-du-mien-nui-bac-bo__vi-du",
  "regionId": "trung-du-mien-nui-bac-bo",
  "category": "landmark",
  "title": "Tên địa danh",
  "summary": "1–2 câu ngắn, dễ hiểu.",
  "highlights": ["Đặc điểm nổi bật 1", "Đặc điểm nổi bật 2"],
  "keyPoints": ["Điều em cần ghi nhớ"],
  "funFacts": ["Em có biết? (không bắt buộc)"],
  "location": { "lat": 0, "lng": 0, "placeName": "Tên tỉnh" },
  "images": [{ "imageId": "...", "alt": "...", "credit": "...", "license": "...", "sourceUrl": "..." }],
  "audio": { "src": "/audio/....mp3", "credit": "...", "license": "..." },
  "relatedIds": ["trung-du-mien-nui-bac-bo__muc-khac"],
  "sources": [{ "title": "SGK Lịch sử và Địa lí 4, Bài <n>: <tên bài>", "url": "https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172", "note": "tr. <trang>" }],
  "status": "draft"
}
```

`category` là một trong các giá trị: `natural` (Đặc điểm tự nhiên), `culture` (Lễ hội và văn hóa), `mineral` (Khoáng sản), `landmark` (Danh lam thắng cảnh), `historical_site` (Di tích lịch sử).

Các trường `funFacts`, `location`, `provinceId`, `audio` là tùy chọn. Mục không có tọa độ thì không hiện trên bản đồ (ví dụ: khí hậu).

**Không được bịa tọa độ.** Chỉ điền `location` khi đã có nguồn tọa độ tin cậy, và ghi nguồn đó vào `sources`.

## Câu hỏi (`quizzes[].questions[]`)

Mọi câu hỏi đều có: `id`, `prompt`, `explanation`, `sources`, `status`, `type`. Phần còn lại tùy theo dạng câu hỏi:

| `type` | Trường riêng |
|---|---|
| `single_choice` | `options`: đúng 4 đáp án; `answerIndex`: 0–3 |
| `true_false` | `answer`: `true` hoặc `false` |
| `map_locate` | `targetItemId`; `candidateItemIds` (phải chứa `targetItemId`, mọi ứng viên phải có `location`) |
| `matching` | `pairs`: ít nhất 2 cặp `{ "left": "...", "right": "..." }` |

## Quy trình duyệt

1. Mục mới luôn để `"status": "draft"`. Bản chạy thử (`npm run dev`) vẫn hiện mục draft; **bản production chỉ hiện mục `verified`**.
2. Giáo viên đối chiếu với SGK theo bài và trang ghi trong `sources`, rồi đổi sang `"status": "verified"`.
3. Mục `verified` bắt buộc có ít nhất một nguồn trỏ tới link SGK.
4. Chạy `npm test`. Test kiểm tra toàn vẹn dữ liệu sẽ báo lỗi nếu: trùng id, sai tiền tố id, `relatedIds` trỏ tới mục không tồn tại, ảnh chưa có trong manifest, tọa độ nằm ngoài Việt Nam, hoặc mục đã duyệt chưa trích nguồn SGK.

## Giọng văn (học sinh lớp 4)

- Câu ngắn, mỗi câu không quá 20 từ; `summary` tối đa 2 câu.
- Xưng "em" khi nói với học sinh.
- Dùng từ quen thuộc; thuật ngữ mới thì giải thích ngay trong câu.
- Diễn đạt lại bằng lời của mình, **không chép nguyên văn** SGK.
