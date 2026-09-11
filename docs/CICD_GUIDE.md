# 🚀 Hướng Dẫn CI/CD GitHub Actions - Quẻ Hôm Nay

Tài liệu này hướng dẫn chi tiết về hệ thống Tích hợp liên tục (CI) và Triển khai liên tục (CD) tự động của dự án **Quẻ Hôm Nay**.

---

## 📋 1. Tổng Quan Kiến Trúc CI/CD

```mermaid
flowchart LR
    A[Lập trình viên Push / PR] --> B[GitHub Actions CI]
    
    subgraph CI_Pipeline [CI Workflow: ci.yml]
        B --> C[Oxlint Code Quality]
        B --> D[Vite Build Frontend]
        C & D --> E[Khởi chạy Postgres & Redis Services]
        E --> F[Chạy 12 Kiểm Thử DLQ & Concurrency Queue]
        E --> G[Kiểm tra RBAC 403 Forbidden Security]
        D --> H[Build Thử Nghiệm Docker Multi-stage]
    end
    
    subgraph CD_Pipeline [CD Workflow: deploy.yml]
        F & G & H --> I{Merge vào main hoặc Tạo Release Tag}
        I --> J[Build & Push Image lên GHCR: ghcr.io]
        J --> K[SSH Remote Deploy lên Máy Chủ VPS]
        K --> L[Docker Compose Pull & Zero-downtime Restart]
    end
```

---

## ⚙️ 2. Chi Tiết Các Quy Trình (Workflows)

### 🔹 Workflow 1: Continuous Integration (`.github/workflows/ci.yml`)
- **Kích hoạt khi:**
  - Có `push` hoặc `pull_request` vào nhánh `main` hoặc `develop`.
  - Kích hoạt thủ công qua nút **Run workflow** (`workflow_dispatch`).
- **Nhiệm vụ tự động:**
  1. **Kiểm tra chất lượng mã (Lint):** Chạy `oxlint` quét toàn bộ 80+ file với 100+ quy tắc tĩnh trong ~40ms.
  2. **Biên dịch Frontend:** Đóng gói production bundle bằng Vite.
  3. **Khởi chạy Service Containers chuẩn GitHub Actions:**
     - **PostgreSQL 16 Alpine** (Port 5432 với lệnh health check `pg_isready`).
     - **Redis 7 Alpine** (Port 6379 với lệnh health check `redis-cli ping`).
  4. **Chạy bộ kiểm thử tự động (`npm test`):**
     - Đẩy và lấy tác vụ từ Dead Letter Queue (DLQ).
     - Thử lại tác vụ lỗi và phục hồi (`retryFailedJob`).
     - Bỏ qua tác vụ hỏng (`discardFailedJob`).
     - Khóa nguyên tử Mutex chống spam rút quẻ đồng thời (HTTP 429).
     - Bộ điều tiết hàng đợi AI Luna Concurrency Limiter (tối đa 5 luồng đồng thời).
     - Kiểm tra an ninh phân quyền RBAC: người dùng thường nhận 403 Forbidden khi truy cập `/api/admin/dlq`.
  5. **Kiểm tra đóng gói Docker:** Xác thực `Dockerfile` đa tầng (multi-stage) biên dịch thành công.

---

### 🔹 Workflow 2: Continuous Deployment (`.github/workflows/deploy.yml`)
- **Kích hoạt khi:**
  - Có `push` vào nhánh `main` (sau khi CI đã pass).
  - Có tag phát hành mới (ví dụ: `v1.0.0`, `v1.1.0`).
  - Kích hoạt thủ công với lựa chọn môi trường `production` hoặc `staging`.
- **Nhiệm vụ tự động:**
  1. **Đóng gói Docker Image:** Tự động gắn tag `latest`, `sha-xxxx`, `vX.Y.Z`.
  2. **Đẩy ảnh lên GitHub Container Registry (GHCR):** Hoàn toàn miễn phí, lưu trữ tại `ghcr.io/<username>/<repo>`.
  3. **Tự động cập nhật máy chủ VPS (Deploy via SSH):**
     - Đăng nhập vào VPS qua SSH Key an toàn.
     - Kéo container image mới nhất về máy chủ: `docker compose pull`.
     - Tái khởi động dịch vụ không gián đoạn: `docker compose up -d --remove-orphans`.
     - Dọn dẹp image cũ: `docker image prune -f`.

---

## 🔑 3. Thiết Lập GitHub Secrets (Tùy Chọn Cho Triển Khai VPS)

Nếu bạn muốn CD tự động đẩy code lên máy chủ VPS của bạn khi merge vào `main`, hãy vào:
> **GitHub Repository** ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **New repository secret**

Thêm các biến bí mật sau:

| Tên Secret | Ý Nghĩa | Ví Dụ |
| :--- | :--- | :--- |
| `DEPLOY_HOST` | Địa chỉ IP hoặc tên miền máy chủ VPS | `103.xxx.xxx.xxx` hoặc `api.quehomnay.vn` |
| `DEPLOY_USER` | Tên người dùng SSH | `ubuntu` hoặc `root` |
| `DEPLOY_KEY` | Khóa bảo mật SSH Private Key (ed25519 hoặc rsa) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `DEPLOY_PORT` | Cổng SSH (mặc định là 22 nếu bỏ trống) | `22` |
| `DEPLOY_PATH` | Đường dẫn chứa mã nguồn trên VPS | `/var/www/quehomnay` |
| `ENV_PRODUCTION` | Toàn bộ nội dung tệp `.env` môi trường production (tự động tạo tệp `.env` trên VPS khi deploy) | `PORT=5001\nDATABASE_URL=...` |

> 💡 **Lưu ý:** Nếu bạn chưa có máy chủ VPS hoặc chưa cấu hình các secrets trên, pipeline CD sẽ **không bị lỗi** mà sẽ tự động lưu container image lên GHCR và thông báo hướng dẫn trong phần tóm tắt của GitHub Actions.

---

## 🛠️ 4. Kiểm Thử Cục Bộ Trước Khi Đẩy Code (Local Verification)

Trước khi commit và push lên GitHub, bạn có thể kiểm tra nhanh bằng các lệnh:

```bash
# 1. Kiểm tra cú pháp và linter
npm run lint

# 2. Kiểm tra đóng gói build production
npm run build

# 3. Chạy toàn bộ kiểm thử tự động (DLQ, Mutex, RBAC)
npm test
```
