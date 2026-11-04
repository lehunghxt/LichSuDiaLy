# Triển khai

Trang là web tĩnh (SPA). Mọi đường dẫn không phải file phải trả về `index.html`.

## Vercel (đang dùng)

- Project: `em-kham-pha-lsdl`. Trang chính: https://em-kham-pha-lsdl.vercel.app
- `vercel.json` đã cấu hình build `npm run build`, thư mục `dist`, và rewrite các đường dẫn không có đuôi file về `/index.html`.
- Bản xem thử (URL riêng):

  ```bash
  npx vercel@latest deploy --yes --build-env VITE_SHOW_DRAFTS=true
  ```

- Lên trang chính:

  ```bash
  npx vercel@latest deploy --prod --yes --build-env VITE_SHOW_DRAFTS=true
  ```

- **Không dùng `vercel promote`.** Promote build lại mà không có `VITE_SHOW_DRAFTS`, nên nội dung nháp và ảnh nháp bị ẩn (các chủ đề hiện "0 mục").

## Host tĩnh khác (Netlify, Cloudflare Pages, …)

- Build: `npm run build`, thư mục xuất bản `dist`.
- `public/_redirects` (`/* /index.html 200`) được chép vào `dist/` để các host này trả `index.html` cho mọi đường dẫn.
- Đặt trong thư mục con: build với `VITE_BASE=/ten-thu-muc/`.

## Trước mỗi lần triển khai

1. `npm run verify` sạch.
2. `npm run images:check` → 0 link hỏng.
3. Mở bản xem thử, thử mở thẳng một đường dẫn sâu (ví dụ `/ban-do/nam-bo`) rồi tải lại trang.
