import os
import urllib.request

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))

YUNET_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
SFACE_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

YUNET_PATH = os.path.join(MODELS_DIR, "face_detection_yunet_2023mar.onnx")
SFACE_PATH = os.path.join(MODELS_DIR, "face_recognition_sface_2021dec.onnx")

def check_and_download_models():
    """Kiểm tra và tự động tải mô hình YuNet và SFace nếu chưa có"""
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR, exist_ok=True)
        print(f"[MODELS] Đã tạo thư mục lưu trữ mô hình tại: {MODELS_DIR}")
        
    download_model_if_missing("YuNet (Face Detector)", YUNET_URL, YUNET_PATH)
    download_model_if_missing("SFace (Face Recognizer)", SFACE_URL, SFACE_PATH)

def download_model_if_missing(name: str, url: str, dest_path: str):
    if os.path.exists(dest_path):
        print(f"[MODELS] Đã tìm thấy {name} tại {dest_path}")
        return
        
    print(f"[MODELS] Không tìm thấy {name}. Bắt đầu tải từ: {url}")
    try:
        # Tải tệp tin với urllib
        urllib.request.urlretrieve(url, dest_path)
        print(f"[MODELS] Tải thành công {name} lưu tại {dest_path}")
    except Exception as e:
        print(f"[MODELS] Lỗi khi tải {name}: {e}")
        # Thử đường link mirror dự phòng nếu github bị chặn/chậm
        print(f"[MODELS] Thử link dự phòng...")
        # (Ở đây có thể thêm link mirror nếu cần thiết)
        raise e
