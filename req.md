# PROJECT: WEBSITE KHÁM PHÁ LỊCH SỬ VÀ ĐỊA LÍ VIỆT NAM

## 1. Vai trò

Bạn là Senior Frontend Architect, ReactJS Developer và UI/UX Designer.

Hãy phân tích, thiết kế và triển khai một website học tập tương tác dành cho học sinh lớp 4 với chủ đề **"Em khám phá Lịch sử và Địa lí Việt Nam"**.

Mục tiêu: Giúp học sinh khám phá kiến thức lịch sử, địa lí Việt Nam một cách trực quan thông qua bản đồ 2D, hình ảnh, nội dung tương tác và trò chơi học tập.

Ưu tiên giao diện đẹp, sinh động, dễ sử dụng, phù hợp với học sinh tiểu học.

## 2. Công nghệ

- ReactJS + TypeScript (TSX)
- Vite
- Tailwind CSS
- Leaflet + GeoJSON hoặc giải pháp bản đồ 2D phù hợp hơn
- Static JSON để lưu nội dung
- LocalStorage để lưu tiến độ học tập
- Lucide React cho icon

**Yêu cầu bắt buộc:**
- Website hoạt động hoàn toàn dưới dạng Static Web
- Không Backend, Database, API Server
- Không yêu cầu đăng nhập
- Có thể deploy lên Vercel, Netlify hoặc Cloudflare Pages
- Responsive trên PC, tablet và điện thoại
- Thiết kế có khả năng mở rộng mà không phải viết lại kiến trúc

## 3. Các chức năng chính

### 3.1. Bản đồ Việt Nam 2D tương tác

Đây là tính năng quan trọng nhất của website.

- Hiển thị bản đồ Việt Nam với các vùng địa lí được phân biệt bằng màu sắc
- Học sinh có thể nhấn vào từng vùng để khám phá
- Khi chọn vùng, bản đồ làm nổi bật vùng đó
- Hỗ trợ phóng to, thu nhỏ và di chuyển bản đồ
- Hiển thị tên vùng, thông tin tổng quan và các chủ đề kiến thức
- Có thể nhấn vào từng tỉnh hoặc các địa danh tiêu biểu để xem chi tiết
- Hiển thị các điểm đánh dấu địa danh trên bản đồ
- Có chức năng quay lại bản đồ Việt Nam

**Giai đoạn đầu:** Triển khai vùng Trung du và miền núi Bắc Bộ.

Kiến trúc phải cho phép mở rộng sang tất cả các vùng địa lí Việt Nam trong tương lai.

Sử dụng dữ liệu bản đồ có nguồn đáng tin cậy. Không tự tạo ranh giới hoặc tọa độ địa lí không chính xác. Phân biệt vùng địa lí theo chương trình học với đơn vị hành chính hiện hành.

### 3.2. Khám phá kiến thức theo chủ đề

Khi học sinh chọn một vùng, hiển thị các nhóm kiến thức:

1. Đặc điểm tự nhiên
2. Lễ hội và văn hóa
3. Khoáng sản
4. Danh lam thắng cảnh
5. Di tích lịch sử

Mỗi nội dung cần hỗ trợ:

- Tên và hình ảnh minh họa
- Mô tả ngắn gọn, dễ hiểu
- Thông tin chi tiết
- Vị trí trên bản đồ nếu phù hợp
- Video hoặc âm thanh thuyết minh nếu có
- Các kiến thức thú vị hoặc câu hỏi tương tác

Nội dung phải phù hợp với học sinh lớp 4 và bám sát chương trình Lịch sử và Địa lí.

### 3.3. Giao diện khám phá địa danh

Khi học sinh nhấn vào một địa danh:

- Hiển thị hình ảnh
- Tên địa danh
- Vị trí
- Giới thiệu
- Những đặc điểm nổi bật
- Các kiến thức cần ghi nhớ
- Có thể xem thêm địa danh liên quan
- Có nút trở về bản đồ

Ưu tiên trình bày nội dung trực quan, tránh quá nhiều chữ.

### 3.4. Trò chơi và trắc nghiệm

Xây dựng hệ thống ôn tập kiến thức sau khi khám phá.

Các dạng trò chơi:

- Trắc nghiệm 4 đáp án
- Đúng / Sai
- Xác định địa danh trên bản đồ
- Ghép địa danh với đặc điểm tương ứng

Yêu cầu:

- Chấm điểm tự động
- Hiển thị đáp án đúng
- Giải thích ngắn gọn
- Có hiệu ứng khi trả lời
- Có thể chơi lại
- Có thể mở rộng thêm các loại trò chơi mới

### 3.5. Theo dõi tiến độ học tập

Sử dụng LocalStorage để lưu:

- Những vùng đã khám phá
- Những địa danh đã xem
- Bài trắc nghiệm đã hoàn thành
- Điểm số
- Tiến độ học tập

Không cần tài khoản người dùng. Dữ liệu chỉ được lưu trên trình duyệt hiện tại.

## 4. Thiết kế UI/UX

Thiết kế giao diện dựa trên phong cách website giáo dục tương tác dành cho học sinh tiểu học.

Định hướng:

- Giao diện hiện đại, màu sắc tươi sáng
- Bản đồ Việt Nam là thành phần nổi bật
- Bố cục rõ ràng, ít gây rối mắt
- Các vùng địa lí có màu sắc riêng
- Icon thân thiện, dễ hiểu
- Card nội dung có hình ảnh sinh động
- Nút bấm lớn, phù hợp thao tác của học sinh
- Font chữ hỗ trợ tiếng Việt tốt
- Có hiệu ứng hover, click, transition nhẹ nhàng

**Giao diện bản đồ đề xuất:**

Desktop:
- Header: Logo, Trang chủ, Bản đồ khám phá, Trắc nghiệm, Tiến độ học tập
- Bên trái: Bản đồ Việt Nam và danh sách vùng địa lí
- Bên phải: Thông tin vùng được chọn, các chủ đề kiến thức, địa danh tiêu biểu

Mobile:
- Bản đồ ở phía trên
- Nội dung khám phá ở phía dưới
- Menu điều hướng phù hợp màn hình nhỏ

Tham khảo hình giao diện đã cung cấp trong cuộc hội thoại. Không cần sao chép tuyệt đối, có thể cải tiến để tối ưu trải nghiệm.

## 5. Kiến trúc và khả năng mở rộng

Thiết kế theo hướng Feature-Based Architecture.

Các yêu cầu quan trọng:

- Tách UI, dữ liệu và business logic
- Tạo component có khả năng tái sử dụng
- Sử dụng TypeScript strict mode
- Không hardcode nội dung học tập trong TSX
- Dữ liệu nội dung được quản lý bằng JSON
- Dữ liệu bản đồ sử dụng GeoJSON hoặc định dạng phù hợp
- Dễ bổ sung vùng địa lí, tỉnh, địa danh, chủ đề mới
- Dễ bổ sung dạng trò chơi mới
- Hạn chế duplicate code
- Tối ưu hiệu năng và dung lượng tải
- Lazy load bản đồ, hình ảnh và các trang cần thiết
- Có xử lý lỗi khi dữ liệu hoặc hình ảnh không tồn tại

Ưu tiên đơn giản, dễ bảo trì. Không over-engineering.

## 6. Khả năng mở rộng trong tương lai

Thiết kế hệ thống để sau này có thể bổ sung:

- Toàn bộ các vùng địa lí Việt Nam
- Bản đồ theo tỉnh
- Bản đồ chuyên đề: khoáng sản, địa hình, sông ngòi, di tích lịch sử
- Bộ lọc nội dung theo chủ đề
- Tìm kiếm địa danh
- Học tập theo từng bài trong SGK
- Hệ thống nhiệm vụ khám phá
- Huy hiệu và phần thưởng học tập
- Chế độ trình chiếu dành cho giáo viên
- Hoạt động tương tác trên bảng thông minh
- Nội dung học tập có âm thanh và hình ảnh phong phú
- Chế độ sử dụng offline (PWA)

Chỉ triển khai những tính năng cần thiết cho MVP. Các tính năng mở rộng phải được tính đến trong kiến trúc nhưng chưa cần xây dựng ngay.

## 7. Yêu cầu triển khai

Trước khi code:

1. Phân tích yêu cầu và đề xuất kiến trúc phù hợp
2. Kiểm tra cấu trúc dự án hiện tại
3. Lập kế hoạch triển khai theo từng giai đoạn
4. Xác định thư viện và giải pháp bản đồ tối ưu
5. Xác định cách tổ chức dữ liệu để dễ mở rộng
6. Đề xuất các cải tiến nếu cần thiết

Sau đó thực hiện:

- Xây dựng giao diện
- Xây dựng bản đồ tương tác
- Tích hợp nội dung học tập mẫu đã kiểm chứng
- Tạo hệ thống khám phá kiến thức
- Xây dựng trò chơi trắc nghiệm
- Tích hợp lưu tiến độ học tập
- Kiểm thử chức năng
- Tối ưu và build production

## 8. Các nguyên tắc quan trọng

- Không tạo Backend hoặc Database
- Không thêm thư viện không cần thiết
- Không hardcode dữ liệu địa lí trong component
- Không tự bịa tọa độ, ranh giới hoặc kiến thức lịch sử
- Không sử dụng hình ảnh không rõ quyền sử dụng
- Không thiết kế UI quá phức tạp với học sinh lớp 4
- Không triển khai nhiều tính năng nâng cao khi phần bản đồ cốt lõi chưa ổn định
- Không đánh đổi tính chính xác của kiến thức để lấy hiệu ứng đẹp

## 9. Kết quả mong muốn

Một website ReactJS + TypeScript hoàn chỉnh, có giao diện đẹp, bản đồ Việt Nam 2D tương tác, cho phép học sinh khám phá vùng Trung du và miền núi Bắc Bộ, xem kiến thức theo chủ đề, tham gia trò chơi và theo dõi tiến độ.

Website phải chạy ổn định dưới dạng Static Web và dễ mở rộng cho các vùng địa lí tiếp theo.

**Hãy chủ động phân tích và đề xuất các giải pháp tốt hơn nếu phát hiện vấn đề trong yêu cầu. Không cần bám cứng vào một cách triển khai nếu có phương án tối ưu hơn.**

Bắt đầu bằng việc lập kế hoạch triển khai và xây dựng MVP. Sau đó thực hiện theo kế hoạch, kiểm tra kết quả và báo cáo những phần đã hoàn thành, những phần còn hạn chế.