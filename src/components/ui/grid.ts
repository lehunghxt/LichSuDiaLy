// Lưới tự co giãn theo chỗ trống của khung chứa (không theo thiết bị): mỗi ô rộng ít nhất bằng mốc,
// đủ chỗ thì thêm cột. Component dùng chung xếp lưới bằng các lớp này thay cho sm:/md:/lg:grid-cols-N.
// Chuỗi viết nguyên văn để Tailwind quét được.
export const GRID = {
  /** ô ≥ 10rem: thẻ số liệu, ô nhỏ */
  xs: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,10rem),1fr))]',
  /** ô ≥ 13rem: lựa chọn ngắn, ảnh nhỏ */
  sm: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))]',
  /** ô ≥ 17rem: thẻ có chữ, lựa chọn dài */
  md: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))]',
  /** ô ≥ 22rem: thẻ lớn */
  lg: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))]',
  /** ô ≥ 28rem: hai khối nội dung cạnh nhau khi khung đủ rộng */
  xl: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,28rem),1fr))]',
} as const

/** Như GRID.xs nhưng các ô giãn ra lấp đầy hàng (auto-fit): dùng cho một dãy ít ô cố định, ví dụ các ô số liệu,
 *  để màn rộng không bỏ trống cột bên phải */
export const GRID_FILL_XS = 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]'
