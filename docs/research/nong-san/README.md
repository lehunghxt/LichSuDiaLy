# Cây trồng tiêu biểu — bản để giáo viên duyệt

Ngày soạn: 2026-11-08. Dữ liệu: `src/data/produce/crops.json`; ảnh: `image-picks/_nong-san.json` → `src/data/produce/images.json` (`node scripts/commons-fetch.mjs --produce`).

## Cách phân loại

- **Cây công nghiệp**: chè, cà phê, cao su, hồ tiêu, điều, mía, lạc, cói, thuốc lào (theo cách SGK gọi chè, cà phê, cao su, hồ tiêu, điều, mía, lạc là cây công nghiệp).
- **Cây nông nghiệp**: lúa, rau màu, cây ăn quả, cây dược liệu/gia vị. Dừa xếp ở đây vì SGK (tr. 103) nêu dừa trong nhóm cây ăn quả của Nam Bộ.
- Không đưa vật nuôi, thủy sản, sản phẩm chế biến.

## Cây của vùng (theo SGK LS&ĐL 4, KNTT)

| Vùng | Cây công nghiệp | Cây nông nghiệp | Trang |
|---|---|---|---|
| trung-du-mien-nui-phia-bac | Chè | Lúa | tr. 21, 25 |
| dong-bang-bac-bo | — | Lúa, Rau màu | tr. 43 |
| bac-trung-bo-va-nam-trung-bo | Cà phê, Hồ tiêu, Cao su, Chè, Mía, Lạc | Lúa | tr. 75 |
| nam-bo | Cao su, Điều, Hồ tiêu | Lúa, Sầu riêng, Chôm chôm, Xoài, Dừa, Cam, Quýt | tr. 103 |

## Cây của tỉnh (NGOÀI SGK — trạng thái nháp, cần duyệt)

Nguồn: bài Wikipedia tiếng Việt của tỉnh, hoặc của tỉnh cũ đã sáp nhập vào tỉnh mới (ghi rõ trong cột nguồn). Mỗi cặp đã được kiểm tra bằng cách tìm nguyên từ (không khớp một phần chữ) trong bài và đọc câu chứa nó.

| Tỉnh | Cây | Nhóm | Nguồn |
|---|---|---|---|
| Lai Châu | Chè | Công nghiệp | [Wikipedia tiếng Việt: Lai Châu](https://vi.wikipedia.org/wiki/Lai_Ch%C3%A2u) |
| Lai Châu | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Lai Châu](https://vi.wikipedia.org/wiki/Lai_Ch%C3%A2u) |
| Lai Châu | Thảo quả | Nông nghiệp | [Wikipedia tiếng Việt: Lai Châu](https://vi.wikipedia.org/wiki/Lai_Ch%C3%A2u) |
| Lai Châu | Sâm | Nông nghiệp | [Wikipedia tiếng Việt: Lai Châu](https://vi.wikipedia.org/wiki/Lai_Ch%C3%A2u) |
| Điện Biên | Chè | Công nghiệp | [Wikipedia tiếng Việt: Điện Biên](https://vi.wikipedia.org/wiki/%C4%90i%E1%BB%87n_Bi%C3%AAn) |
| Điện Biên | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Điện Biên](https://vi.wikipedia.org/wiki/%C4%90i%E1%BB%87n_Bi%C3%AAn) |
| Sơn La | Chè | Công nghiệp | [Wikipedia tiếng Việt: Sơn La](https://vi.wikipedia.org/wiki/S%C6%A1n_La) |
| Sơn La | Mận | Nông nghiệp | [Wikipedia tiếng Việt: Sơn La](https://vi.wikipedia.org/wiki/S%C6%A1n_La) |
| Sơn La | Xoài | Nông nghiệp | [Wikipedia tiếng Việt: Sơn La](https://vi.wikipedia.org/wiki/S%C6%A1n_La) |
| Sơn La | Nhãn | Nông nghiệp | [Wikipedia tiếng Việt: Sơn La](https://vi.wikipedia.org/wiki/S%C6%A1n_La) |
| Lào Cai | Chè | Công nghiệp | [Wikipedia tiếng Việt: Lào Cai](https://vi.wikipedia.org/wiki/L%C3%A0o_Cai) |
| Lào Cai | Thảo quả | Nông nghiệp | [Wikipedia tiếng Việt: Lào Cai](https://vi.wikipedia.org/wiki/L%C3%A0o_Cai) |
| Lào Cai | Mận | Nông nghiệp | [Wikipedia tiếng Việt: Lào Cai](https://vi.wikipedia.org/wiki/L%C3%A0o_Cai) |
| Lào Cai | Quế | Nông nghiệp | [Wikipedia tiếng Việt: Yên Bái (tỉnh)](https://vi.wikipedia.org/wiki/Y%C3%AAn_B%C3%A1i_%28t%E1%BB%89nh%29) |
| Tuyên Quang | Chè | Công nghiệp | [Wikipedia tiếng Việt: Tuyên Quang](https://vi.wikipedia.org/wiki/Tuy%C3%AAn_Quang) |
| Tuyên Quang | Cam | Nông nghiệp | [Wikipedia tiếng Việt: Tuyên Quang](https://vi.wikipedia.org/wiki/Tuy%C3%AAn_Quang) |
| Tuyên Quang | Bưởi | Nông nghiệp | [Wikipedia tiếng Việt: Tuyên Quang](https://vi.wikipedia.org/wiki/Tuy%C3%AAn_Quang) |
| Cao Bằng | Chè | Công nghiệp | [Wikipedia tiếng Việt: Cao Bằng](https://vi.wikipedia.org/wiki/Cao_B%E1%BA%B1ng) |
| Cao Bằng | Hạt dẻ | Nông nghiệp | [Wikipedia tiếng Việt: Cao Bằng](https://vi.wikipedia.org/wiki/Cao_B%E1%BA%B1ng) |
| Cao Bằng | Lê | Nông nghiệp | [Wikipedia tiếng Việt: Cao Bằng](https://vi.wikipedia.org/wiki/Cao_B%E1%BA%B1ng) |
| Cao Bằng | Quýt | Nông nghiệp | [Wikipedia tiếng Việt: Cao Bằng](https://vi.wikipedia.org/wiki/Cao_B%E1%BA%B1ng) |
| Thái Nguyên | Chè | Công nghiệp | [Wikipedia tiếng Việt: Thái Nguyên](https://vi.wikipedia.org/wiki/Th%C3%A1i_Nguy%C3%AAn) |
| Thái Nguyên | Quýt | Nông nghiệp | [Wikipedia tiếng Việt: Bắc Kạn (tỉnh)](https://vi.wikipedia.org/wiki/B%E1%BA%AFc_K%E1%BA%A1n_%28t%E1%BB%89nh%29) |
| Thái Nguyên | Hồng | Nông nghiệp | [Wikipedia tiếng Việt: Bắc Kạn (tỉnh)](https://vi.wikipedia.org/wiki/B%E1%BA%AFc_K%E1%BA%A1n_%28t%E1%BB%89nh%29) |
| Lạng Sơn | Hồi | Nông nghiệp | [Wikipedia tiếng Việt: Lạng Sơn](https://vi.wikipedia.org/wiki/L%E1%BA%A1ng_S%C6%A1n) |
| Lạng Sơn | Na (mãng cầu) | Nông nghiệp | [Wikipedia tiếng Việt: Lạng Sơn](https://vi.wikipedia.org/wiki/L%E1%BA%A1ng_S%C6%A1n) |
| Lạng Sơn | Quýt | Nông nghiệp | [Wikipedia tiếng Việt: Lạng Sơn](https://vi.wikipedia.org/wiki/L%E1%BA%A1ng_S%C6%A1n) |
| Phú Thọ | Chè | Công nghiệp | [Wikipedia tiếng Việt: Phú Thọ](https://vi.wikipedia.org/wiki/Ph%C3%BA_Th%E1%BB%8D) |
| Phú Thọ | Bưởi | Nông nghiệp | [Wikipedia tiếng Việt: Phú Thọ](https://vi.wikipedia.org/wiki/Ph%C3%BA_Th%E1%BB%8D) |
| Phú Thọ | Cam | Nông nghiệp | [Wikipedia tiếng Việt: Hòa Bình (tỉnh)](https://vi.wikipedia.org/wiki/H%C3%B2a_B%C3%ACnh_%28t%E1%BB%89nh%29) |
| Phú Thọ | Mía | Công nghiệp | [Wikipedia tiếng Việt: Hòa Bình (tỉnh)](https://vi.wikipedia.org/wiki/H%C3%B2a_B%C3%ACnh_%28t%E1%BB%89nh%29) |
| Phú Thọ | Su su | Nông nghiệp | [Wikipedia tiếng Việt: Vĩnh Phúc (tỉnh)](https://vi.wikipedia.org/wiki/V%C4%A9nh_Ph%C3%BAc_%28t%E1%BB%89nh%29) |
| Quảng Ninh | Chè | Công nghiệp | [Wikipedia tiếng Việt: Quảng Ninh](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Ninh) |
| Quảng Ninh | Na (mãng cầu) | Nông nghiệp | [Wikipedia tiếng Việt: Quảng Ninh](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Ninh) |
| Bắc Ninh | Vải | Nông nghiệp | [Wikipedia tiếng Việt: Bắc Giang (tỉnh)](https://vi.wikipedia.org/wiki/B%E1%BA%AFc_Giang_%28t%E1%BB%89nh%29) |
| Bắc Ninh | Chè | Công nghiệp | [Wikipedia tiếng Việt: Bắc Giang (tỉnh)](https://vi.wikipedia.org/wiki/B%E1%BA%AFc_Giang_%28t%E1%BB%89nh%29) |
| Hải Phòng | Thuốc lào | Công nghiệp | [Wikipedia tiếng Việt: Hải Phòng](https://vi.wikipedia.org/wiki/H%E1%BA%A3i_Ph%C3%B2ng) |
| Hải Phòng | Vải | Nông nghiệp | [Wikipedia tiếng Việt: Hải Dương (tỉnh)](https://vi.wikipedia.org/wiki/H%E1%BA%A3i_D%C6%B0%C6%A1ng_%28t%E1%BB%89nh%29) |
| Hải Phòng | Cà rốt | Nông nghiệp | [Wikipedia tiếng Việt: Hải Dương (tỉnh)](https://vi.wikipedia.org/wiki/H%E1%BA%A3i_D%C6%B0%C6%A1ng_%28t%E1%BB%89nh%29) |
| Hải Phòng | Tỏi | Nông nghiệp | [Wikipedia tiếng Việt: Hải Dương (tỉnh)](https://vi.wikipedia.org/wiki/H%E1%BA%A3i_D%C6%B0%C6%A1ng_%28t%E1%BB%89nh%29) |
| Hưng Yên | Nhãn | Nông nghiệp | [Wikipedia tiếng Việt: Hưng Yên](https://vi.wikipedia.org/wiki/H%C6%B0ng_Y%C3%AAn) |
| Hưng Yên | Chuối | Nông nghiệp | [Wikipedia tiếng Việt: Hưng Yên](https://vi.wikipedia.org/wiki/H%C6%B0ng_Y%C3%AAn) |
| Ninh Bình | Cói | Công nghiệp | [Wikipedia tiếng Việt: Ninh Bình](https://vi.wikipedia.org/wiki/Ninh_B%C3%ACnh) |
| Ninh Bình | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Nam Định (tỉnh)](https://vi.wikipedia.org/wiki/Nam_%C4%90%E1%BB%8Bnh_%28t%E1%BB%89nh%29) |
| Thanh Hóa | Mía | Công nghiệp | [Wikipedia tiếng Việt: Thanh Hóa](https://vi.wikipedia.org/wiki/Thanh_H%C3%B3a) |
| Thanh Hóa | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Thanh Hóa](https://vi.wikipedia.org/wiki/Thanh_H%C3%B3a) |
| Nghệ An | Cam | Nông nghiệp | [Wikipedia tiếng Việt: Nghệ An](https://vi.wikipedia.org/wiki/Ngh%E1%BB%87_An) |
| Hà Tĩnh | Lạc | Công nghiệp | [Wikipedia tiếng Việt: Hà Tĩnh](https://vi.wikipedia.org/wiki/H%C3%A0_T%C4%A9nh) |
| Hà Tĩnh | Chè | Công nghiệp | [Wikipedia tiếng Việt: Hà Tĩnh](https://vi.wikipedia.org/wiki/H%C3%A0_T%C4%A9nh) |
| Hà Tĩnh | Bưởi | Nông nghiệp | [Wikipedia tiếng Việt: Hà Tĩnh](https://vi.wikipedia.org/wiki/H%C3%A0_T%C4%A9nh) |
| Hà Tĩnh | Cam | Nông nghiệp | [Wikipedia tiếng Việt: Hà Tĩnh](https://vi.wikipedia.org/wiki/H%C3%A0_T%C4%A9nh) |
| Quảng Trị | Hồ tiêu | Công nghiệp | [Wikipedia tiếng Việt: Quảng Trị](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Tr%E1%BB%8B) |
| Quảng Trị | Cà phê | Công nghiệp | [Wikipedia tiếng Việt: Quảng Trị](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Tr%E1%BB%8B) |
| Quảng Trị | Cao su | Công nghiệp | [Wikipedia tiếng Việt: Quảng Trị](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Tr%E1%BB%8B) |
| Huế | Thanh trà | Nông nghiệp | [Wikipedia tiếng Việt: Huế](https://vi.wikipedia.org/wiki/Hu%E1%BA%BF) |
| Huế | Sen | Nông nghiệp | [Wikipedia tiếng Việt: Huế](https://vi.wikipedia.org/wiki/Hu%E1%BA%BF) |
| Đà Nẵng | Quế | Nông nghiệp | [Wikipedia tiếng Việt: Quảng Nam](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Nam) |
| Đà Nẵng | Sâm | Nông nghiệp | [Wikipedia tiếng Việt: Quảng Nam](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Nam) |
| Quảng Ngãi | Mía | Công nghiệp | [Wikipedia tiếng Việt: Quảng Ngãi](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Ng%C3%A3i) |
| Quảng Ngãi | Tỏi | Nông nghiệp | [Wikipedia tiếng Việt: Quảng Ngãi](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Ng%C3%A3i) |
| Quảng Ngãi | Quế | Nông nghiệp | [Wikipedia tiếng Việt: Quảng Ngãi](https://vi.wikipedia.org/wiki/Qu%E1%BA%A3ng_Ng%C3%A3i) |
| Quảng Ngãi | Sâm | Nông nghiệp | [Wikipedia tiếng Việt: Kon Tum (tỉnh)](https://vi.wikipedia.org/wiki/Kon_Tum_%28t%E1%BB%89nh%29) |
| Gia Lai | Hồ tiêu | Công nghiệp | [Wikipedia tiếng Việt: Gia Lai](https://vi.wikipedia.org/wiki/Gia_Lai) |
| Gia Lai | Cà phê | Công nghiệp | [Wikipedia tiếng Việt: Gia Lai](https://vi.wikipedia.org/wiki/Gia_Lai) |
| Gia Lai | Cao su | Công nghiệp | [Wikipedia tiếng Việt: Gia Lai](https://vi.wikipedia.org/wiki/Gia_Lai) |
| Đắk Lắk | Cà phê | Công nghiệp | [Wikipedia tiếng Việt: Cà phê Buôn Ma Thuột](https://vi.wikipedia.org/wiki/C%C3%A0_ph%C3%AA_Bu%C3%B4n_Ma_Thu%E1%BB%99t) |
| Đắk Lắk | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Đắk Lắk](https://vi.wikipedia.org/wiki/%C4%90%E1%BA%AFk_L%E1%BA%AFk) |
| Đắk Lắk | Dừa | Nông nghiệp | [Wikipedia tiếng Việt: Phú Yên (tỉnh)](https://vi.wikipedia.org/wiki/Ph%C3%BA_Y%C3%AAn_%28t%E1%BB%89nh%29) |
| Khánh Hòa | Xoài | Nông nghiệp | [Wikipedia tiếng Việt: Khánh Hòa](https://vi.wikipedia.org/wiki/Kh%C3%A1nh_H%C3%B2a) |
| Khánh Hòa | Nho | Nông nghiệp | [Wikipedia tiếng Việt: Ninh Thuận](https://vi.wikipedia.org/wiki/Ninh_Thu%E1%BA%ADn) |
| Khánh Hòa | Tỏi | Nông nghiệp | [Wikipedia tiếng Việt: Ninh Thuận](https://vi.wikipedia.org/wiki/Ninh_Thu%E1%BA%ADn) |
| Khánh Hòa | Táo ta | Nông nghiệp | [Wikipedia tiếng Việt: Ninh Thuận](https://vi.wikipedia.org/wiki/Ninh_Thu%E1%BA%ADn) |
| Lâm Đồng | Chè | Công nghiệp | [Wikipedia tiếng Việt: Lâm Đồng](https://vi.wikipedia.org/wiki/L%C3%A2m_%C4%90%E1%BB%93ng) |
| Lâm Đồng | Cà phê | Công nghiệp | [Wikipedia tiếng Việt: Lâm Đồng](https://vi.wikipedia.org/wiki/L%C3%A2m_%C4%90%E1%BB%93ng) |
| Lâm Đồng | Thanh long | Nông nghiệp | [Wikipedia tiếng Việt: Bình Thuận (tỉnh)](https://vi.wikipedia.org/wiki/B%C3%ACnh_Thu%E1%BA%ADn_%28t%E1%BB%89nh%29) |
| Đồng Nai | Cao su | Công nghiệp | [Wikipedia tiếng Việt: Đồng Nai](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_Nai) |
| Đồng Nai | Bưởi | Nông nghiệp | [Wikipedia tiếng Việt: Đồng Nai](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_Nai) |
| Đồng Nai | Điều | Công nghiệp | [Wikipedia tiếng Việt: Bình Phước (tỉnh)](https://vi.wikipedia.org/wiki/B%C3%ACnh_Ph%C6%B0%E1%BB%9Bc_%28t%E1%BB%89nh%29) |
| Tây Ninh | Mía | Công nghiệp | [Wikipedia tiếng Việt: Tây Ninh](https://vi.wikipedia.org/wiki/T%C3%A2y_Ninh) |
| Tây Ninh | Cao su | Công nghiệp | [Wikipedia tiếng Việt: Tây Ninh](https://vi.wikipedia.org/wiki/T%C3%A2y_Ninh) |
| Tây Ninh | Na (mãng cầu) | Nông nghiệp | [Wikipedia tiếng Việt: Tây Ninh](https://vi.wikipedia.org/wiki/T%C3%A2y_Ninh) |
| Tây Ninh | Sắn (khoai mì) | Nông nghiệp | [Wikipedia tiếng Việt: Tây Ninh](https://vi.wikipedia.org/wiki/T%C3%A2y_Ninh) |
| Tây Ninh | Thanh long | Nông nghiệp | [Wikipedia tiếng Việt: Long An (tỉnh)](https://vi.wikipedia.org/wiki/Long_An_%28t%E1%BB%89nh%29) |
| Tây Ninh | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Long An (tỉnh)](https://vi.wikipedia.org/wiki/Long_An_%28t%E1%BB%89nh%29) |
| Đồng Tháp | Xoài | Nông nghiệp | [Wikipedia tiếng Việt: Đồng Tháp](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_Th%C3%A1p) |
| Đồng Tháp | Sen | Nông nghiệp | [Wikipedia tiếng Việt: Đồng Tháp](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_Th%C3%A1p) |
| Đồng Tháp | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Đồng Tháp](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_Th%C3%A1p) |
| Đồng Tháp | Quýt | Nông nghiệp | [Wikipedia tiếng Việt: Đồng Tháp](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93ng_Th%C3%A1p) |
| An Giang | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: An Giang](https://vi.wikipedia.org/wiki/An_Giang) |
| Vĩnh Long | Dừa | Nông nghiệp | [Wikipedia tiếng Việt: Bến Tre (tỉnh)](https://vi.wikipedia.org/wiki/B%E1%BA%BFn_Tre_%28t%E1%BB%89nh%29) |
| Vĩnh Long | Bưởi | Nông nghiệp | [Wikipedia tiếng Việt: Vĩnh Long](https://vi.wikipedia.org/wiki/V%C4%A9nh_Long) |
| Vĩnh Long | Cam | Nông nghiệp | [Wikipedia tiếng Việt: Vĩnh Long](https://vi.wikipedia.org/wiki/V%C4%A9nh_Long) |
| Cần Thơ | Hành | Nông nghiệp | [Wikipedia tiếng Việt: Sóc Trăng (tỉnh)](https://vi.wikipedia.org/wiki/S%C3%B3c_Tr%C4%83ng_%28t%E1%BB%89nh%29) |
| Cần Thơ | Dứa (khóm) | Nông nghiệp | [Wikipedia tiếng Việt: Hậu Giang](https://vi.wikipedia.org/wiki/H%E1%BA%ADu_Giang) |
| Cần Thơ | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Cần Thơ](https://vi.wikipedia.org/wiki/C%E1%BA%A7n_Th%C6%A1) |
| Cà Mau | Lúa | Nông nghiệp | [Wikipedia tiếng Việt: Cà Mau](https://vi.wikipedia.org/wiki/C%C3%A0_Mau) |

## Tỉnh chưa có dữ liệu

Hà Nội, TP. Hồ Chí Minh: bài nguồn không nêu rõ cây trồng tiêu biểu nên để trống, không tự thêm.

## Đã loại sau khi đọc ngữ cảnh

- Hà Nội: hoa (không có câu nào trong bài nêu), bưởi/cam/nhãn/đào/quất (không xuất hiện).
- Lào Cai: lê; Bắc Ninh: lạc; Hải Phòng: hành; Hưng Yên: lúa (Thái Bình); Nghệ An: lạc; Lâm Đồng: hoa, rau (câu không đủ rõ); TP. Hồ Chí Minh: cao su (Bình Dương, chỉ nhắc doanh nghiệp).
- Những từ trùng chữ bị loại: "Ba Na", "Campuchia", "Lê" (họ), "hồi giáo", "sông Bưởi", "bộ lạc", "điều chỉnh"…

## Cần giáo viên lưu ý

- Nghệ An — cam: nguồn chỉ nêu "cam xã Đoài" trong danh sách đặc sản du lịch.
- Đắk Lắk — cà phê: lấy từ bài "Cà phê Buôn Ma Thuột" vì bài tỉnh chỉ nhắc doanh nghiệp.
- Ảnh chụp ngoài Việt Nam (cà phê, điều, cói, cam, quýt…): chú thích chỉ ghi tên cây, không ghi địa danh Việt Nam.
