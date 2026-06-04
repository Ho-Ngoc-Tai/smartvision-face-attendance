import cv2
import numpy as np
import os

class FaceDetector:
    """
    Giai đoạn 1: Phát hiện khuôn mặt (Face Detection).
    Sử dụng YOLOv8-Face làm mặc định trong thiết kế thạc sĩ.
    Trong mã nguồn mẫu này, để đảm bảo hệ thống có thể chạy ngay lập tức mà không yêu cầu GPU hoặc
    tải trọng lượng mô hình quá nặng (.pt), chúng tôi triển khai thêm bộ phát hiện OpenCV Haar Cascade dự phòng.
    """
    def __init__(self, model_path: str = "models/yolov8n-face.pt"):
        self.model_path = model_path
        self.use_yolo = False
        
        # Thử tải mô hình YOLOv8-Face nếu thư viện ultralytics đã được cài đặt và file mô hình tồn tại
        if os.path.exists(model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.use_yolo = True
                print("[DETECTOR] Đã tải thành công mô hình YOLOv8-Face.")
            except ImportError:
                print("[DETECTOR] Chưa cài đặt 'ultralytics'. Sử dụng OpenCV Haar Cascade làm dự phòng.")
        else:
            print(f"[DETECTOR] Không tìm thấy file {model_path}. Sử dụng OpenCV Haar Cascade làm dự phòng.")
            
        # Khởi tạo OpenCV Haar Cascade làm dự phòng để demo chạy ngay lập tức
        if not self.use_yolo:
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.cascade = cv2.CascadeClassifier(cascade_path)
            print("[DETECTOR] Đã khởi tạo OpenCV Haar Cascade.")

    def detect(self, img_np: np.ndarray) -> list:
        """
        Nhận vào ảnh dạng numpy array (BGR).
        Trả về danh sách các bounding box: [[x_min, y_min, x_max, y_max]]
        """
        boxes = []
        h, w, _ = img_np.shape

        if self.use_yolo:
            # Hiện thực hóa dự đoán bằng YOLOv8-Face
            results = self.model(img_np, verbose=False)
            for r in results:
                # r.boxes chứa tọa độ xyxy
                for box in r.boxes:
                    xyxy = box.xyxy[0].cpu().numpy()
                    # Định dạng x_min, y_min, x_max, y_max
                    boxes.append([
                        int(xyxy[0]), int(xyxy[1]), 
                        int(xyxy[2]), int(xyxy[3])
                    ])
        else:
            # Sử dụng bộ nhận diện Haar Cascade dự phòng
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
            faces = self.cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            for (x, y, w_f, h_f) in faces:
                boxes.append([x, y, x + w_f, y + h_f])

        # Trong trường hợp ảnh thử nghiệm không bắt được mặt (do webcam giả lập hoặc môi trường tối),
        # Trả về toàn bộ ảnh như một bounding box lớn để demo không bị gián đoạn.
        if len(boxes) == 0:
            # MOCKUP: Giả định toàn bộ ảnh là khuôn mặt nếu không nhận diện được để tránh lỗi demo
            # Thực tế: Khi có camera thật, hãy bỏ phần mock này đi.
            pass

        return boxes
