import cv2
import numpy as np
import os

class FaceDetector:
    """
    Giai đoạn 1: Phát hiện khuôn mặt (Face Detection).
    Sử dụng YuNet ONNX (OpenCV DNN) làm mô hình học sâu mặc định.
    Hỗ trợ phát hiện Landmark khuôn mặt phục vụ căn chỉnh (Face Alignment).
    Nếu không tải được mô hình, tự động fallback về Haar Cascade.
    """
    def __init__(self, model_path: str = None):
        if model_path is None:
            # Đường dẫn mặc định đến thư mục models
            model_path = os.path.abspath(os.path.join(
                os.path.dirname(__file__), "..", "models", "face_detection_yunet_2023mar.onnx"
            ))
            
        self.model_path = model_path
        self.use_yunet = False
        self.detector = None
        
        # Thử khởi tạo YuNet
        if os.path.exists(model_path):
            try:
                # Tạo bộ phát hiện FaceDetectorYN của OpenCV
                # Đầu vào kích thước ban đầu giả lập (320, 320), sẽ thay đổi động theo ảnh thực tế
                self.detector = cv2.FaceDetectorYN.create(
                    model_path,
                    "",
                    (320, 320),
                    score_threshold=0.6,
                    nms_threshold=0.3,
                    top_k=5000
                )
                self.use_yunet = True
                print(f"[DETECTOR] Đã tải thành công mô hình YuNet từ: {model_path}")
            except Exception as e:
                print(f"[DETECTOR] Lỗi khi khởi tạo YuNet: {e}. Chuyển sang Haar Cascade.")
        else:
            print(f"[DETECTOR] Không tìm thấy file mô hình tại {model_path}. Chuyển sang Haar Cascade.")
            
        # Khởi tạo Haar Cascade làm dự phòng
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.cascade = cv2.CascadeClassifier(cascade_path)
        print("[DETECTOR] Đã khởi tạo OpenCV Haar Cascade làm dự phòng.")

    def detect(self, img_np: np.ndarray) -> tuple:
        """
        Nhận vào ảnh dạng numpy array (BGR).
        Trả về tuple: (boxes, faces_raw)
        - boxes: Danh sách các bounding box [[x_min, y_min, x_max, y_max], ...]
        - faces_raw: Array chứa Landmark và thông tin thô từ YuNet (phục vụ SFace align), hoặc None nếu dùng Haar Cascade.
        """
        boxes = []
        faces_raw = None
        h, w, _ = img_np.shape

        if self.use_yunet and self.detector is not None:
            try:
                # Cài đặt kích thước ảnh đầu vào động
                self.detector.setInputSize((w, h))
                retval, faces = self.detector.detect(img_np)
                
                if retval and faces is not None:
                    faces_raw = faces
                    for face in faces:
                        # face[0:4] là [x, y, width, height]
                        x = int(face[0])
                        y = int(face[1])
                        width = int(face[2])
                        height = int(face[3])
                        
                        x_min = int(max(0, x).item()) if hasattr(max(0, x), "item") else int(max(0, x))
                        y_min = int(max(0, y).item()) if hasattr(max(0, y), "item") else int(max(0, y))
                        x_max = int(min(w, x + width).item()) if hasattr(min(w, x + width), "item") else int(min(w, x + width))
                        y_max = int(min(h, y + height).item()) if hasattr(min(h, y + height), "item") else int(min(h, y + height))
                        
                        boxes.append([x_min, y_min, x_max, y_max])
            except Exception as e:
                print(f"[DETECTOR] Lỗi khi nhận diện bằng YuNet: {e}")
                
        # Fallback về Haar Cascade nếu không dùng YuNet hoặc YuNet không phát hiện ra mặt
        if len(boxes) == 0:
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
            faces = self.cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            for (x, y, w_f, h_f) in faces:
                x_min = int(max(0, x).item()) if hasattr(max(0, x), "item") else int(max(0, x))
                y_min = int(max(0, y).item()) if hasattr(max(0, y), "item") else int(max(0, y))
                x_max = int(min(w, x + w_f).item()) if hasattr(min(w, x + w_f), "item") else int(min(w, x + w_f))
                y_max = int(min(h, y + h_f).item()) if hasattr(min(h, y + h_f), "item") else int(min(h, y + h_f))
                boxes.append([x_min, y_min, x_max, y_max])
                
        return boxes, faces_raw
