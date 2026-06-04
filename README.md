# SmartVision Face Attendance System
## Luận văn Thạc sĩ - Hệ thống điểm danh bằng khuôn mặt (Decoupled Client-Server Pipeline 2 giai đoạn)

Dự án này gồm ba phân hệ độc lập:
1. **frontend-nextjs:** Giao diện người dùng web thời gian thực.
2. **backend-nestjs:** Cổng API gateway điều phối xác thực và lưu dữ liệu.
3. **ai-server-fastapi:** Máy chủ xử lý mô hình Deep Learning (YOLOv8-Face + FaceNet).

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Phân hệ AI Inference Service (FastAPI)
Đảm bảo máy của bạn đã cài đặt Python 3.8+.
```bash
cd ai-server-fastapi
# Khuyên dùng venv (môi trường ảo)
python -m venv venv
venv\Scripts\activate

# Cài đặt thư viện
pip install -r requirements.txt

# Khởi chạy server
uvicorn main:app --reload --port 8000
```
*API sẽ chạy tại: `http://localhost:8000`*

---

### 2. Phân hệ Backend Gateway (NestJS)
Đảm bảo máy đã cài đặt Node.js.
```bash
cd backend-nestjs
npm install
npm run start:dev
```
*Gateway sẽ chạy tại: `http://localhost:3000`*

---

### 3. Phân hệ Front-End Client (Next.js)
```bash
cd frontend-nextjs
npm install
npm run dev
```
*Giao diện người dùng sẽ chạy tại: `http://localhost:3001` (hoặc `http://localhost:3000` tùy cổng trống)*
*Truy cập đường dẫn: `http://localhost:3001/attendance` để mở giao diện điểm danh.*

---

## 📁 Cấu trúc dữ liệu đầu ra
- **Cơ sở dữ liệu Vector (Pickle):** Lưu trữ tại `ai-server-fastapi/data/db_features.pkl` dưới dạng mảng byte đã tuần tự hóa.
- **Nhật ký điểm danh (CSV):** Tự động ghi nhận khi nhận diện khuôn mặt khớp thành công, được lưu tại `backend-nestjs/data/attendance.csv`.
