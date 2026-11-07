# Bố cục riêng cho điện thoại, máy tính bảng, máy tính

Ngày 2026-11-07. Người dùng yêu cầu:
- tổ chức code hỗ trợ desktop, tablet, mobile;
- sửa ở thiết bị này không ảnh hưởng thiết bị khác;
- ngôn ngữ thiết kế mobile ưu tiên bottom sheet;
- component dùng chung được viết lại để tái sử dụng.

## Quyết định của người dùng

- **Tablet, trang bản đồ:** bản đồ toàn màn hình, thông tin vùng là khung nổi bo góc ở mép phải (~380px), cuộn riêng, đóng được. Thanh tab ở đáy.
- **Phạm vi:** cả app, làm theo đợt.
  - **Đợt 1:** nền tảng, trang bản đồ, khung xem bài.
  - **Đợt 2:** Trang chủ, Header/menu, trắc nghiệm, tiến độ, hộp xác nhận, trình xem ảnh.
- **Trên điện thoại dùng bottom sheet cho:**
  - thông tin vùng (đã có);
  - khung xem bài;
  - hộp xác nhận;
  - menu ☰ của các trang khác;
  - trình xem ảnh phóng to.

## Thiết kế

### Một nguồn sự thật về thiết bị

`src/lib/device.ts`:
- `type Device = 'mobile' | 'tablet' | 'desktop'`
- `deviceOf(width)`: dưới 768 là `mobile`; 768–1023 là `tablet`; từ 1024 là `desktop`.
- `useDevice()`: theo dõi `matchMedia`, cập nhật khi xoay màn hình hoặc đổi cỡ cửa sổ.

Code chọn bố cục bằng `useDevice()`, không dùng lớp `sm:`/`md:`/`lg:` để rẽ nhánh.

### Mỗi thiết bị một file bố cục

Màn hình nào có bố cục khác nhau theo thiết bị thì có ba file `Mobile…`, `Tablet…`, `Desktop…`, đặt cạnh nhau trong thư mục của màn hình đó:
- **Trang bản đồ:** `src/pages/map/`.
- **Khung xem bài:** `src/features/content/section-modal/`.

Mỗi file chỉ sắp đặt các phần; trạng thái và logic nằm ở component cha dùng chung (ví dụ `MapPage`). Sửa `MobileMapLayout` chỉ đổi điện thoại.

### Component dùng chung không biết về màn hình

Khung vùng, thẻ tỉnh, nội dung bài, danh sách tab, câu hỏi… không chứa lớp `sm:`/`md:`/`lg:`/`xl:`. Nếu cần hai kiểu hiển thị thì nhận prop (ví dụ `variant`), và file bố cục chọn kiểu.

Test `src/test/responsiveClasses.test.ts` quét `src/**/*.tsx` và báo đỏ khi thấy lớp responsive ngoài các file bố cục (`*Layout.tsx`, `Mobile*`, `Tablet*`, `Desktop*`). Các file của đợt 2 nằm trong danh sách chờ; danh sách chỉ được rút ngắn.

### Bottom sheet dùng chung

`src/components/sheet/`:
- **`useSheetDrag`:** cử chỉ kéo ở thanh nắm. Chiều cao hoặc độ dời lưu trong ref; phân biệt kéo với bấm.
- **`SheetHandle`:** thanh nắm.
- **`SnapSheet`:** tấm không chặn (thông tin vùng), có các mức `peek | half | full`, nằm trên thanh tab.
- **`BottomSheet`:** tấm dạng hộp thoại (khung xem bài, xác nhận, menu, ảnh):
  - nền mờ, bấm nền để đóng;
  - kéo xuống quá 120px để đóng;
  - Esc để đóng; giữ Tab trong tấm; trả focus khi đóng.

## Không làm

- Không đổi nội dung, dữ liệu, URL.
- Không đổi giao diện desktop hiện tại, trừ khi tách code buộc phải đổi.
