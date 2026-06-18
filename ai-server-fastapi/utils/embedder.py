import cv2
import numpy as np
import os

class FaceEmbedder:
    """
    Giai đoạn 2: Trích xuất Vector Embedding 128 chiều (Face Embedding).
    Sử dụng mô hình SFace ONNX (OpenCV DNN) làm mặc định.
    Hỗ trợ căn chỉnh khuôn mặt dựa trên Landmark để tăng độ chính xác.
    """
    def __init__(self, model_path: str = None):
        if model_path is None:
            # Đường dẫn mặc định đến thư mục models
            model_path = os.path.abspath(os.path.join(
                os.path.dirname(__file__), "..", "models", "face_recognition_sface_2021dec.onnx"
            ))
            
        self.model_path = model_path
        self.use_sface = False
        self.recognizer = None
        
        # Thử khởi tạo SFace
        if os.path.exists(model_path):
            try:
                self.recognizer = cv2.FaceRecognizerSF.create(model_path, "")
                self.use_sface = True
                print(f"[EMBEDDER] Đã tải thành công mô hình SFace từ: {model_path}")
            except Exception as e:
                print(f"[EMBEDDER] Lỗi khi khởi tạo SFace: {e}. Chuyển sang chế độ trích xuất mock.")
        else:
            print(f"[EMBEDDER] Không tìm thấy file mô hình tại {model_path}. Chuyển sang chế độ trích xuất mock.")

    def extract_features(self, face_img: np.ndarray, original_img: np.ndarray = None, face_raw: np.ndarray = None) -> np.ndarray:
        """
        Nhận vào:
        - face_img: Ảnh khuôn mặt đã được cắt (cropped face image).
        - original_img: (Tùy chọn) Ảnh gốc chưa cắt (BGR).
        - face_raw: (Tùy chọn) Row thông tin thô của khuôn mặt từ YuNet (phục vụ alignCrop).
        Trả về:
        - Mảng numpy 1D chứa 128 phần tử, đã chuẩn hóa L2.
        """
        if self.use_sface and self.recognizer is not None:
            try:
                # Trường hợp 1: Có ảnh gốc và thông tin landmark từ YuNet -> Căn chỉnh chuẩn
                if original_img is not None and face_raw is not None:
                    # alignCrop sẽ tự động xoay và cắt ảnh khuôn mặt về kích thước 112x112 phù hợp với SFace
                    aligned_face = self.recognizer.alignCrop(original_img, face_raw)
                else:
                    # Trường hợp 2: Dự phòng (ví dụ Haar Cascade) -> Resize trực tiếp về 112x112
                    aligned_face = cv2.resize(face_img, (112, 112))
                
                # Trích xuất vector đặc trưng
                embedding = self.recognizer.feature(aligned_face)
                
                # Biến đổi thành mảng 1D
                feature_vector = embedding[0].flatten().astype(np.float32)
                
                # Chuẩn hóa L2 bổ sung để chắc chắn độ dài vector = 1
                norm = np.linalg.norm(feature_vector)
                if norm > 0:
                    feature_vector = feature_vector / norm
                    
                return feature_vector
            except Exception as e:
                print(f"[EMBEDDER] Lỗi trích xuất SFace: {e}. Sử dụng mock fallback.")
                
        # CHẾ ĐỘ MÔ PHỎNG DỰ PHÒNG (Deterministic Mock Fallback)
        # Chỉ chạy khi mô hình SFace lỗi hoặc không tồn tại file
        resized = cv2.resize(face_img, (16, 8)) # 16x8x1 = 128 chiều
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        feature_vector = gray.flatten().astype(np.float32)
        
        feature_vector = np.sin(feature_vector / 255.0)
        norm = np.linalg.norm(feature_vector)
        if norm > 0:
            feature_vector = feature_vector / norm
            
        return feature_vector
