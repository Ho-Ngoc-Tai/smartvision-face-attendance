import base64
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.download_utils import check_and_download_models
from utils.db_handler import FeatureDatabaseHandler
from utils.detector import FaceDetector
from utils.embedder import FaceEmbedder

app = FastAPI(
    title="SmartVision Face Recognition AI Server",
    description="Python FastAPI Inference Service - YuNet & SFace ONNX",
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

# Tự động kiểm tra và tải trọng số mô hình khi khởi chạy
try:
    check_and_download_models()
except Exception as e:
    print(f"[STARTUP] Không thể chuẩn bị mô hình học sâu: {e}. Hệ thống sẽ sử dụng fallback OpenCV Haar Cascade.")

# Khởi tạo các module lõi
db_handler = FeatureDatabaseHandler("data/db_features.pkl")
detector = FaceDetector()
embedder = FaceEmbedder()

# Ngưỡng khoảng cách Cosine (Cosine Distance Threshold) đối với SFace
# SFace đã được tối ưu hóa tốt, ngưỡng nhận diện cùng danh tính tốt nhất thường là <= 0.36
COSINE_THRESHOLD = 0.36

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
    return {"message": "AI Server đang hoạt động với YuNet & SFace.", "status": "online"}

@app.post("/api/v1/faces/register")
def register_face(payload: RegisterRequest):
    """
    Chức năng 1: Đăng ký khuôn mặt mới.
    - Phát hiện vị trí & 5 landmarks khuôn mặt bằng YuNet.
    - Căn chỉnh & trích xuất Vector 128 chiều bằng SFace.
    - Lưu nối tiếp (Push) vào file .pkl.
    """
    img = decode_base64_image(payload.image)
    
    # Bước 1: Phát hiện vị trí khuôn mặt
    boxes, faces_raw = detector.detect(img)
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
        
    # Bước 2: Cắt vùng khuôn mặt để dự phòng
    x_min, y_min, x_max, y_max = boxes[0]
    h, w, _ = img.shape
    x_min, y_min = max(0, x_min), max(0, y_min)
    x_max, y_max = min(w, x_max), min(h, y_max)
    face_crop = img[y_min:y_max, x_min:x_max]
    
    # Bước 3: Trích xuất vector đặc trưng SFace với Landmark Alignment
    face_raw_single = faces_raw[0] if faces_raw is not None else None
    embedding = embedder.extract_features(face_crop, original_img=img, face_raw=face_raw_single)
    
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
    - Phát hiện mọi khuôn mặt kèm Landmark.
    - Thực hiện căn chỉnh ảnh và trích xuất vector đặc trưng.
    - Đối sánh khoảng cách Cosine với database để định danh.
    """
    img = decode_base64_image(payload.image)
    
    # Bước 1: Phát hiện khuôn mặt
    boxes, faces_raw = detector.detect(img)
    predictions = []
    
    if len(boxes) == 0:
        return {
            "status": "success",
            "predictions": []
        }
        
    # Nạp cơ sở dữ liệu vector
    db = db_handler.load_db()
    
    # Bước 2: Duyệt qua từng khuôn mặt được phát hiện
    for idx, box in enumerate(boxes):
        x_min, y_min, x_max, y_max = box
        h, w, _ = img.shape
        x_min, y_min = max(0, x_min), max(0, y_min)
        x_max, y_max = min(w, x_max), min(h, y_max)
        
        face_crop = img[y_min:y_max, x_min:x_max]
        if face_crop.size == 0:
            continue
            
        # Trích xuất vector đặc trưng với căn chỉnh
        face_raw_single = faces_raw[idx] if faces_raw is not None else None
        query_embedding = embedder.extract_features(face_crop, original_img=img, face_raw=face_raw_single)
        
        best_name = "Unknown"
        min_distance = 2.0
        
        # Bước 3: So sánh khoảng cách Cosine với database
        for name, saved_embeddings in db.items():
            for saved_emb in saved_embeddings:
                saved_emb_np = np.array(saved_emb)
                
                # Tính Cosine Distance
                dot_product = np.dot(query_embedding, saved_emb_np)
                cosine_dist = 1.0 - dot_product
                
                if cosine_dist < min_distance:
                    min_distance = cosine_dist
                    if cosine_dist <= COSINE_THRESHOLD:
                        best_name = name

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
