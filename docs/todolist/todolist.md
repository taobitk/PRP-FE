# 📋 GoPRP-FE — Annotation Module Implementation Map

> Dựa trên hồ sơ: `D:\code\file code\Go\GoPRP\docs\FE_Contracts\annotation`
> Trạng thái: **Đang triển khai** 🏗️

---

## 🖥️ 1. Màn hình & Giao diện (UI/UX)
- [ ] **Màn hình "Tải lên tài liệu"**
  - [x] Textarea hỗ trợ Markdown ✅
  - [x] Input Tiêu đề tài liệu ✅
  - [x] Nút "Phân tích tài liệu" (Shatter) ✅
  - [x] Trạng thái Loading & Toast thông báo ✅
        - [x] ShatterForm: Unit Test Coverage 🟢
- [ ] **Màn hình "Xem cây Section"**
  - [x] Cây nội dung (Tree View) đệ quy ✅
  - [x] Logic thu gọn/mở rộng (Expand/Collapse) ✅
        - [x] SectionTree: Unit Test Coverage (Logic: 🟢 | UI: 🟢)
        - [x] TagManager: Unit Test Coverage 🟢
        - [x] AnnotationSearch: Unit Test Coverage 🟢
  - [x] Panel chi tiết bên phải (Heading + Content) ✅
- [ ] **Màn hình "Gắn Tag" (Panel chi tiết)**
  - [x] Hiển thị danh sách Tag hiện tại (Chip) ✅
  - [x] Ô input thêm Tag mới & nút Xóa Tag ✅
- [ ] **Màn hình "Tìm kiếm theo Tag"**
  - [x] Search Bar hỗ trợ chọn nhiều Tag ✅
  - [x] Kết quả tìm kiếm dạng Card ✅
  - [x] Chế độ chuyển đổi **AND / OR** mode (UI Switch) ✅

---

## ⚙️ 2. Tích hợp API & Logic (TDD Tier 1)
- [x] **[POST] /annotations/documents (Shatter)** ✅
- [x] **[GET] /annotations/sections/:id/tree (GetTree)** ✅
- [x] **[POST] /annotations/sections/:id/tags (ManageTag)** ✅
- [x] **[GET] /annotations/search (Search)** ✅

---

## ⚠️ 3. Xử lý các Trường hợp biên & Lỗi (Edge Cases)
- [ ] **Lỗi 404:** Khi truy cập Section/Document không tồn tại (GetTree/ManageTag)
- [ ] **Lỗi 400:** Khi gửi sai `action` trong ManageTag hoặc thiếu field bắt buộc
- [ ] **Lỗi 500:** Xử lý thông báo lỗi hệ thống từ Backend
- [ ] **Normalize Tag:** Đảm bảo FE hoặc BE đã chuyển Tag về chữ thường (lowercase)
- [ ] **Tag Inheritance:** Kiểm tra hiển thị kết quả search bao gồm cả Section con kế thừa tag từ cha

---

## 🧪 4. Kiểm thử cấp độ cao (TDD Tier 2 - Playwright)
- [x] **Scenario 1:** Happy Path - Upload Markdown -> Xem cây -> Gắn Tag -> Tìm thấy qua Search 🟢
- [x] **Scenario 2:** Tìm kiếm phức tạp - Chọn nhiều Tag với chế độ AND 🟢
- [x] **Scenario 3:** Điều hướng - Từ kết quả Search click vào card quay về đúng vị trí 🟢

---

## 📌 Ghi chú nhanh
- Backend tự động normalize tag về chữ thường.
- Mỗi lần Shatter là tạo Document mới.
- Tag được kế thừa từ Cha xuống Con trong logic Search.
