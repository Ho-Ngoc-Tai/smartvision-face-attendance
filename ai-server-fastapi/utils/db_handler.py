import os
import pickle
import numpy as np

class FeatureDatabaseHandler:
    """
    Class quản lý đọc/ghi cơ sở dữ liệu Vector Embeddings dưới dạng file pickle (.pkl).
    Hỗ trợ cơ chế One-shot Learning (append trực tiếp vector mới mà không cần train lại).
    """
    def __init__(self, db_path: str = "data/db_features.pkl"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        # Đảm bảo thư mục cha tồn tại
        db_dir = os.path.dirname(self.db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            
        # Khởi tạo file .pkl trống nếu chưa tồn tại
        if not os.path.exists(self.db_path):
            self.save_db({})
            print(f"[DB INITIALIZED] Khởi tạo cơ sở dữ liệu vector mới tại {self.db_path}")

    def load_db(self) -> dict:
        """Tải toàn bộ cơ sở dữ liệu vector khuôn mặt {name: [vector_512]}"""
        try:
            with open(self.db_path, "rb") as f:
                db = pickle.load(f)
                return db if isinstance(db, dict) else {}
        except Exception as e:
            print(f"Lỗi khi nạp cơ sở dữ liệu vector: {e}")
            return {}

    def save_db(self, db_data: dict):
        """Ghi đè toàn bộ dữ liệu vào file .pkl"""
        try:
            with open(self.db_path, "wb") as f:
                pickle.dump(db_data, f)
        except Exception as e:
            print(f"Lỗi khi ghi cơ sở dữ liệu vector: {e}")

    def add_vector(self, name: str, vector: np.ndarray) -> bool:
        """
        Thêm một vector khuôn mặt mới vào database (One-shot Learning).
        Nếu trùng tên, sẽ lưu thêm vector (nhiều góc mặt cho cùng 1 người)
        """
        db = self.load_db()
        
        # Đảm bảo vector được lưu dưới dạng list python hoặc numpy array chuẩn hóa
        vector_list = vector.tolist() if isinstance(vector, np.ndarray) else list(vector)
        
        if name in db:
            # Cho phép một người có nhiều vector khuôn mặt đại diện (multi-gallery)
            db[name].append(vector_list)
        else:
            db[name] = [vector_list]
            
        self.save_db(db)
        print(f"[DB ADD] Đã thêm vector 512-d của '{name}' vào cơ sở dữ liệu.")
        return True
