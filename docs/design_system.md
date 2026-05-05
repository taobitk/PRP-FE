# GoPRP Design System & Color Palette

## Triết lý: "Corporate Clarity"
Xanh Navy làm chủ đạo, Trắng tạo không gian thở, Đen/Xám đậm cho chữ, Accent xanh sáng dẫn hướng action. Giao diện nịnh mắt, chuyên nghiệp, giữ được sự đơn giản không rối mắt.

## Palette Chi Tiết

### 🔵 Primary — Blue Family
| Vai trò | Màu | HEX | Dùng cho |
|---|---|---|---|
| `primary` | Navy Deep | `#1e3a5f` | Nền chính, brand identity |
| `primary-hover` | Navy | `#1a4fa0` | Trạng thái hover |
| `primary-action` | Royal Blue | `#2563eb` | Button chính, CTA, Link |
| `primary-light` | Sky Blue | `#3b82f6` | Icon active, Highlight |
| `primary-subtle` | Blue Mist | `#eff6ff` | Background card hover, Tag BG |

### ⬜ Neutral — White/Black Family
| Vai trò | Màu | HEX | Dùng cho |
|---|---|---|---|
| `background` | Off-White | `#f8fafc` | Nền trang chính |
| `surface` | Pure White | `#ffffff` | Card, Modal, Panel |
| `text-primary` | Charcoal | `#0f172a` | Chữ tiêu đề |
| `text-secondary` | Slate | `#475569` | Chữ mô tả, Label |
| `text-muted` | Gray | `#94a3b8` | Placeholder, Disabled |
| `border` | Light Gray | `#e2e8f0` | Viền card, Divider |

### ✅ Semantic — Trạng thái
| Vai trò | Màu | HEX | Dùng cho |
|---|---|---|---|
| `success` | Emerald | `#10b981` | Badge Active, Thành công |
| `warning` | Amber | `#f59e0b` | Cảnh báo, Đang chờ |
| `danger` | Rose | `#f43f5e` | Lỗi, Xóa, Inactive |
| `info` | Cyan | `#06b6d4` | Thông tin, Tooltip |

## Hướng dẫn triển khai
- Sử dụng các biến CSS trong `globals.css` để định nghĩa màu.
- Tailwind config sẽ trỏ tới các biến CSS này.
- UI Layout: Sử dụng nền sáng (Off-White) cho content, và Navy Deep cho các vùng Header/Sidebar để phân cách rõ ràng.
