/** SGK Lịch sử và Địa lí 4: nguồn đối chiếu bắt buộc cho nội dung đã duyệt */
export const SGK_URL = 'https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172'

/** Link mở trình đọc SGK đúng trang sách `page` (trình đọc lệch 1 trang so với số in trên sách) */
export const sgkPageUrl = (page: number) => `${SGK_URL}#page=${page + 1}`
