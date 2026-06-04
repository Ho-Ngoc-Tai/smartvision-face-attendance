import base64
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.db_handler import FeatureDatabaseHandler
from utils.detector import FaceDetector
from utils.embedder import FaceEmbedder

app = FastAPI(
    title="SmartVision Face Recognition AI Server",
    description="Python FastAPI Inference Service - YOLOv8-Face & FaceNet",
    version="1.0.0"
)

# Cấu hình CORS để cho phép NestJS kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo các module lõi
db_handler = FeatureDatabaseHandler("data/db_features.pkl")
detector = FaceDetector()
embedder = FaceEmbedder()

# Ngưỡng khoảng cách Cosine (Cosine Distance Threshold) để xác định danh tính
# Cosine Distance nằm trong khoảng [0, 2]. Càng gần 0 nghĩa là hai khuôn mặt càng giống nhau.
# Thông thường đối với FaceNet L2-normalized, ngưỡng nhận diện tốt nhất nằm từ 0.35 đến 0.45.
COSINE_THRESHOLD = 0.40

# --- Pydantic Schemas ---
class RegisterRequest(BaseModel):
    name: str
    image: str  # Chuỗi base64 của ảnh (data:image/jpeg;base64,...)

class PredictRequest(BaseModel):
    image: str  # Chuỗi base64 của ảnh

# --- Hàm hỗ trợ ---
def decode_base64_image(base64_str: str) -> np.ndarray:
    """Giải mã chuỗi Base64 từ client thành ảnh OpenCV numpy array (BGR)"""
    try:
        # Tách bỏ header của base64 data URL nếu có
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
            
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Không thể decode ảnh.")
        return img
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chuỗi ảnh base64 không hợp lệ hoặc bị lỗi định dạng: {str(e)}"
        )

# --- Endpoints API ---

@app.get("/")
def read_root():
    return {"message": "AI Server đang hoạt động ổn định.", "status": "online"}

@app.post("/api/v1/faces/register")
def register_face(payload: RegisterRequest):
    """
    Chức năng 1: Đăng ký khuôn mặt mới.
    - Cắt ảnh khuôn mặt (Face Crop) bằng Giai đoạn 1 (Detector).
    - Trích xuất Vector Embedding 512 chiều bằng Giai đoạn 2 (Embedder).
    - Lưu nối tiếp (Push) vào file .pkl mà không cần huấn luyện lại.
    """
    img = decode_base64_image(payload.image)
    
    # Bước 1: Phát hiện vị trí khuôn mặt
    boxes = detector.detect(img)
    if len(boxes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không phát hiện thấy khuôn mặt nào trong ảnh chân dung đăng ký."
        )
    if len(boxes) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phát hiện nhiều hơn 1 khuôn mặt. Chỉ cho phép đăng ký ảnh chân dung đơn."
        )
        
    # Bước 2: Cắt vùng khuôn mặt (Face Crop)
    x_min, y_min, x_max, y_max = boxes[0]
    # Đảm bảo bounding box nằm trong kích thước ảnh
    h, w, _ = img.shape
    x_min, y_min = max(0, x_min), max(0, y_min)
    x_max, y_max = min(w, x_max), min(h, y_max)
    
    face_crop = img[y_min:y_max, x_min:x_max]
    if face_crop.size == 0:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vùng cắt khuôn mặt trống, vui lòng thử lại."
        )
         
    # Bước 3: Trích xuất vector 512 chiều
    embedding = embedder.extract_features(face_crop)
    
    # Bước 4: Lưu vào Database .pkl
    db_handler.add_vector(payload.name, embedding)
    
    return {
        "status": "success",
        "message": f"Đăng ký khuôn mặt thành công cho {payload.name}",
        "data": {
            "name": payload.name,
            "vector_length": len(embedding),
            "box": [x_min, y_min, x_max, y_max]
        }
    }

@app.post("/api/v1/faces/predict")
def predict_face(payload: PredictRequest):
    """
    Chức năng 2: Điểm danh / Quét mặt real-time.
    - Nhận ảnh từ webcam.
    - Phát hiện mọi khuôn mặt.
    - So sánh khoảng cách Cosine của từng khuôn mặt với database.
    - Trả về danh sách định danh và vị trí bounding box.
    """
    img = decode_base64_image(payload.image)
    
    # Bước 1: Phát hiện khuôn mặt
    boxes = detector.detect(img)
    predictions = []
    
    if len(boxes) == 0:
        return {
            "status": "success",
            "predictions": []
        }
        
    # Nạp cơ sở dữ liệu vector
    db = db_handler.load_db()
    
    # Bước 2: Duyệt qua từng khuôn mặt được phát hiện
    for box in boxes:
        x_min, y_min, x_max, y_max = box
        h, w, _ = img.shape
        x_min, y_min = max(0, x_min), max(0, y_min)
        x_max, y_max = min(w, x_max), min(h, y_max)
        
        face_crop = img[y_min:y_max, x_min:x_max]
        if face_crop.size == 0:
            continue
            
        # Trích xuất vector của mặt truy vấn (Query Vector)
        query_embedding = embedder.extract_features(face_crop)
        
        best_name = "Unknown"
        min_distance = 2.0  # Khoảng cách Cosine tối đa là 2.0
        
        # Bước 3: So sánh khoảng cách Cosine với từng người trong database
        for name, saved_embeddings in db.items():
            for saved_emb in saved_embeddings:
                saved_emb_np = np.array(saved_emb)
                
                # Tính Cosine Distance = 1 - Cosine Similarity
                # Vì các vector đã chuẩn hóa L2, Cosine Similarity chỉ là phép nhân vô hướng dot product
                dot_product = np.dot(query_embedding, saved_emb_np)
                cosine_dist = 1.0 - dot_product
                
                if cosine_dist < min_distance:
                    min_distance = cosine_dist
                    # Nếu vượt qua ngưỡng, tạm thời gán tên
                    if cosine_dist <= COSINE_THRESHOLD:
                        best_name = name

        # Quy đổi độ tin cậy từ khoảng cách Cosine để hiển thị UI trực quan
        # Similarity = 1 - Cosine_Distance
        similarity = 1.0 - min_distance
        confidence = float(max(0.0, similarity))

        predictions.append({
            "box": [x_min, y_min, x_max, y_max],
            "name": best_name,
            "confidence": confidence,
            "distance": float(min_distance)
        })
        
    return {
        "status": "success",
        "predictions": predictions
    }
