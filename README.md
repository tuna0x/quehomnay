# 📿 Quẻ Hôm Nay — Chiêm Nghiệm Vận Mệnh Cổ Truyền & Trí Tuệ Nhân Tạo

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

**Một khoảnh khắc tĩnh tại mỗi ngày để lắng lòng chiêm nghiệm, hòa quyện thiền vị dân gian Việt Nam cùng Trí tuệ Nhân tạo thế hệ mới.**

*Tâm thành tất ứng • Thiện niệm khởi sinh*

</div>

---

## 📖 Giới Thiệu Dự Án

Lấy cảm hứng sâu sắc từ phong tục **gieo quẻ, xin xăm đầu xuân tại các ngôi đền, chùa cổ truyền Việt Nam**, **Quẻ Hôm Nay** là một không gian số tĩnh tại, trang nghiêm giúp người dùng gửi gắm tâm nguyện và đón nhận thông điệp định hướng cho công việc, tình duyên, học tập và cuộc sống.

Khác biệt hoàn toàn với các trang bói toán truyền thống mang tính cố định, **Quẻ Hôm Nay** kết hợp:
1. **Mỹ học Cổ phong Thuần Việt:** Nền gỗ sơn mài thâm trầm (`#1A0503`), chữ thếp vàng kim (`#C9A24A`, `#E7C978`), cuộn giấy dó mộc mạc và sắc đỏ chu sa linh thiêng.
2. **Nghi Thức Đa Giác Quan:** Cảm giác lắc ống xăm bằng cử động điện thoại thật (`DeviceMotion API`), âm vang chuông chùa Đại Hồng Chung 432Hz thuần Web Audio không dùng file ghi âm ngoài, thẻ tre đắc duyên bay vút giữa vầng kim quang.
3. **Trí Tuệ Nhân Tạo Luận Quẻ:** Hệ thống AI (GPT-5.6 Luna / Gemini) sáng tác thơ cổ và đàm đạo giải đoán riêng biệt dựa trên chính hoàn cảnh và băn khoăn của từng thiện tín.

---

## ✨ Điểm Nhấn Nổi Bật

### 🪷 1. Trải Nghiệm Nghi Thức Chân Thực
- **Ống Xăm 100% Vector (Pure SVG & CSS):** Không sử dụng ảnh tĩnh raster, hiển thị sắc nét tuyệt đối trên màn hình Retina 4K/8K.
- **Tương Tác Lắc Vật Lý:** Lắc điện thoại thật khi dùng di động, hoặc nhấp giữ kéo chuột trên máy tính kèm phản hồi rung haptic chân thực.
- **Thẻ Quẻ Cuộn Giấy Lụa & Triện Son Đỏ:** Hiệu ứng bung cuộn giấy thư pháp truyền thống kèm dấu triện chu sa ấn định điềm cát hung *(Thượng Cát, Trung Bình, Tiểu Cát)*.

### 📜 2. Thơ Cổ & Chiêm Nghiệm Phong Thủy
- Mỗi quẻ mang tên cổ phong thanh nhã *(Khởi Phong Hóa Long, Minh Nguyệt Chiếu Đầm, Hàn Mai Nghinh Xuân...)*.
- 2 câu thơ cổ hàm súc, lời giải tường minh và lời khuyên hành động hướng thiện.
- Tự động đối chiếu Can Chi, Bản Mệnh theo năm sinh để đưa ra **Màu sắc may mắn**, **Con số cát tường** và **Khung giờ hoàng đạo**.

### 💬 3. Đàm Đạo Cùng Thiền Sư AI (Luna Chat)
- Người dùng có thể trực tiếp trò chuyện, hỏi sâu thêm về lời khuyên của quẻ với phong thái đối thoại nhã nhặn, thấu cảm và hướng thiện.

### 🔒 4. Hạ Tầng Chống Gian Lận & Hàng Đợi (Queue & DLQ)
- **Khóa Mutex (Redis / Hybrid):** Ngăn chặn spam thao tác liên tục hoặc gian lận lượt gieo quẻ miễn phí trong ngày (HTTP 429).
- **Hàng Đợi Luận Quẻ AI:** Tự động điều tiết và xếp hàng khi có nhiều yêu cầu đồng thời, tránh nghẽn luồng.
- **Dead Letter Queue (DLQ):** Lưu vết toàn bộ tác vụ có sự cố để quản trị viên có thể kiểm tra và thử lại (Retry / Discard) chỉ với 1 cú nhấp chuột.

### 🏛️ 5. Cổng Quản Trị Hệ Thống (Admin Portal)
- Phân quyền nghiêm ngặt cấp độ Backend (`role: admin` vs `role: user`).
- Giám sát lưu lượng truy cập theo thời gian thực (Lượt xem, người trực tuyến, thiết bị, biểu đồ xu hướng 7 ngày).
- Quản lý danh sách thành viên (Đăng nhập Email & Google OAuth), lịch sử hoạt động chi tiết và bảng điều khiển Dead Letter Queue.

### 🚀 6. CI/CD Tự Động Hóa Toàn Diện
- Tích hợp sẵn pipeline GitHub Actions kiểm tra chất lượng mã nguồn (`oxlint`), đóng gói frontend (`vite build`), chạy tự động toàn bộ bài test tích hợp với **PostgreSQL & Redis Services**, và tự động đóng gói container lên **GitHub Container Registry (GHCR)**.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

| Tầng Hệ Thống | Công Nghệ Sử Dụng |
| :--- | :--- |
| **Giao Diện (Frontend)** | React 19, Tailwind CSS, Lucide Icons, Pure Web Audio API, Canvas Confetti |
| **Máy Chủ (Backend)** | Node.js, Express 5, kiến trúc mô-đun Controller - Service - Routes |
| **Cơ Sở Dữ Liệu** | PostgreSQL 16 (Dữ liệu người dùng, quẻ, lưu lượng, hoạt động, DLQ) |
| **Bộ Nhớ Đệm & Hàng Đợi** | Redis 7 & Hàng đợi Batch In-Memory (Cơ chế Hybrid Fallback) |
| **Trí Tuệ Nhân Tạo (AI)** | Experiential Labs (GPT-5.6 Luna) / Google Gemini API |
| **DevOps & Tự Động Hóa** | Docker, Docker Compose, GitHub Actions (CI/CD Workflows), GHCR |

---

## 🚀 Bắt Đầu Nhanh (Quick Start)

### 1. Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18+ (khuyên dùng Node 20 LTS).
- **Docker & Docker Compose** (để khởi chạy PostgreSQL & Redis tiện lợi).

### 2. Khởi động môi trường phát triển
```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi động cơ sở dữ liệu PostgreSQL & Redis qua Docker
npm run docker:up

# 3. Tạo tệp cấu hình môi trường
cp .env.example .env

# 4. Khởi chạy đồng thời Frontend và Backend
npm run dev
```

Ứng dụng sẽ khả dụng tại:
- **Giao diện người dùng (Frontend):** `http://localhost:5173`
- **Máy chủ API (Backend):** `http://localhost:5001`

### 3. Kiểm thử tự động & Đóng gói
```bash
# Chạy bộ kiểm thử tự động (DLQ, Mutex Lock, RBAC Security)
npm test

# Quét kiểm tra chất lượng mã (Linter)
npm run lint

# Đóng gói sản phẩm (Production Build)
npm run build
```

---

## 📜 Bản Quyền & Tâm Niệm

Dự án được xây dựng với lòng trân quý văn hóa truyền thống Việt Nam và phát hành theo giấy phép mã nguồn mở **MIT License**.

<div align="center">
  <sub>Nguyện chúc quý thiện tín vạn sự an khang, tâm an trí sáng, vạn dặm hanh thông! 🕊️🇻🇳</sub>
</div>
