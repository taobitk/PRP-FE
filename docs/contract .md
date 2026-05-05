# Yêu cầu bổ sung API - Nâng cấp Cross-Document Outline Editor

**Người gửi:** Đội Frontend
**Người nhận:** Đội Backend
**Mục đích:** Hỗ trợ tính năng kéo thả Section chéo giữa các tài liệu khác nhau.

---

## 1. Tình hình hiện tại (Chúng ta đang có gì?)
Tính năng **Outline Editor** (Quản lý cấu trúc tài liệu bằng Kéo-Thả) hiện tại đang hoạt động cực kỳ mượt mà. 
- FE đã tích hợp `@dnd-kit` cho phép kéo thả, sắp xếp lại thứ tự, và lồng cấp các Section **BÊN TRONG** một tài liệu.
- BE đã có API `PATCH /annotations/documents/:id/sections/reorder` xử lý rất tốt việc cập nhật hàng loạt vị trí của các Section trong cùng một Document.
- BE đã có API `PATCH /annotations/sections/:id` nhưng hiện tại DTO chỉ hỗ trợ cập nhật `heading`, `content`, và `level`.

## 2. Kế hoạch nâng cấp (Chúng ta sẽ làm gì tiếp theo?)
Frontend đang lên kế hoạch xây dựng **Workspace Multi-Panel (Giao diện đa cột)**. 
Người dùng có thể mở song song nhiều tài liệu cùng lúc (VD: Tài liệu A bên trái, Tài liệu B bên phải) và thực hiện **kéo một Section từ Tài liệu A sang Tài liệu B**.

**Luồng nghiệp vụ (Nhu cầu thực tế):**
- Người dùng nắm thẻ `H2` của Tài liệu 1, kéo sang làm thẻ con của `H1` trong Tài liệu 2.
- Yêu cầu đặc biệt: Khi kéo một Section sang tài liệu khác, **chỉ di chuyển duy nhất Section đó**, không kéo theo các Section con của nó (Trường hợp muốn chuyển cả cụm con sẽ tính sau hoặc xử lý ở mức FE/BE sau này, hiện tại ưu tiên di chuyển single node).

## 3. Vấn đề kỹ thuật (Blocker)
Để thực hiện việc này, FE cần thay đổi `document_id` của một Section. 
Tuy nhiên, API update hiện tại (`PATCH /annotations/sections/:id`) **không hỗ trợ** thay đổi `document_id` hay `parent_id` sang một cây khác. Nếu FE dùng phương án "Sửa chắp vá" (Tạo Section mới ở Doc B -> Xóa Section cũ ở Doc A) thì rất rủi ro về mặt toàn vẹn dữ liệu (Data Integrity) nếu một trong hai thao tác thất bại.

## 4. Yêu cầu cho Backend (Cần BE làm gì?)
Đề xuất BE bổ sung một Endpoint mới chuyên dụng cho việc **Di chuyển Section** (Move).

**Endpoint đề xuất:**
```http
PATCH /api/annotations/sections/:id/move
```

**Payload (Body) dự kiến bn có thể sửa cho chuẩn với cảnh sát ko cảnh sát gõ đầu bn đó :**
```json
{
  "target_document_id": 2,      // ID của tài liệu đích
  "parent_id": 15,              // ID của Section cha mới (null nếu thả ra ngoài cùng)
  "position": 3,                // Vị trí mới trong nhánh
  "level": 2                    // Cấp độ mới (H2)
}
```

**Mô tả logic mong muốn ở phía BE:**
1. Cập nhật `document_id` của Section `:id` thành `target_document_id`.
2. Cập nhật `parent_id`, `position`, `level` theo vị trí mới.
3. Vì yêu cầu là **"đi nguyên nó thôi, không kéo theo con"**, BE cần xử lý ngắt kết nối với các Section con hiện tại của nó ở tài liệu cũ (Ví dụ: Đẩy các Section con lên một cấp, hoặc gán `parent_id` của tụi nó sang ông nội). *-> Chi tiết logic mồ côi này BE và FE có thể bàn thêm, nhưng BE cần handle ở phía DB để cây tài liệu cũ không bị gãy.*
4. Tính toán lại `position` cho các Section ở cả tài liệu Nguồn (bị mất node) và tài liệu Đích (được thêm node).

Rất mong BE phản hồi sớm về tính khả thi và thời gian hoàn thành API này để FE tiếp tục phát triển giao diện kéo thả chéo! 🚀
