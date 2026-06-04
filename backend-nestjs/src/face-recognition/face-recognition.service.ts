import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service xử lý điều phối và nghiệp vụ lưu lịch sử điểm danh
 */
@Injectable()
export class FaceRecognitionService {
  private readonly aiServerUrl = 'http://localhost:8000'; // URL máy chủ AI FastAPI
  private readonly dbDirectory = path.join(__dirname, '..', '..', 'data');
  private readonly csvPath = path.join(this.dbDirectory, 'attendance.csv');

  constructor() {
    this.initDatabase();
  }

  // Khởi tạo thư mục và file CSV nếu chưa tồn tại
  private initDatabase() {
    if (!fs.existsSync(this.dbDirectory)) {
      fs.mkdirSync(this.dbDirectory, { recursive: true });
    }
    if (!fs.existsSync(this.csvPath)) {
      const header = 'Họ và tên,Thời gian điểm danh,Độ tin cậy (Cosine Similarity)\n';
      fs.writeFileSync(this.csvPath, header, 'utf8');
    }
  }

  // Chuyển tiếp yêu cầu đăng ký sang FastAPI
  async registerFace(name: string, base64Image: string) {
    try {
      const response = await axios.post(`${this.aiServerUrl}/api/v1/faces/register`, {
        name,
        image: base64Image,
      });
      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  // Chuyển tiếp yêu cầu điểm danh sang FastAPI và ghi file CSV nếu thành công
  async predictFace(base64Image: string) {
    try {
      const response = await axios.post(`${this.aiServerUrl}/api/v1/faces/predict`, {
        image: base64Image,
      });

      const data = response.data;

      // Nếu phát hiện và nhận dạng thành công mặt hợp lệ, ghi nhận điểm danh vào CSV
      if (data.status === 'success' && data.predictions && data.predictions.length > 0) {
        const bestMatch = data.predictions[0];
        
        // Chỉ lưu log nếu không phải là "Unknown"
        if (bestMatch.name && bestMatch.name !== 'Unknown') {
          await this.logAttendanceToCSV(bestMatch.name, bestMatch.confidence);
        }
      }

      return data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  // Ghi nhận lịch sử điểm danh vào file CSV (luồng I/O không chặn)
  private async logAttendanceToCSV(name: string, confidence: number): Promise<void> {
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const formattedConfidence = (confidence * 100).toFixed(2) + '%';
    const logLine = `"${name}","${timestamp}","${formattedConfidence}"\n`;

    return new Promise((resolve, reject) => {
      fs.appendFile(this.csvPath, logLine, 'utf8', (err) => {
        if (err) {
          console.error('Lỗi khi ghi lịch sử điểm danh vào CSV:', err);
          return reject(err);
        }
        console.log(`[ĐIỂM DANH THÀNH CÔNG] Đã ghi nhận: ${name} lúc ${timestamp}`);
        resolve();
      });
    });
  }

  // Xử lý lỗi kết nối ngoại vi sang FastAPI
  private handleHttpError(error: any) {
    if (error.response) {
      throw new HttpException(
        error.response.data.message || 'Lỗi xử lý từ máy chủ AI.',
        error.response.status || HttpStatus.BAD_REQUEST,
      );
    }
    throw new HttpException(
      'Không thể kết nối đến máy chủ AI (FastAPI). Vui lòng đảm bảo AI server đang chạy ở cổng 8000.',
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}
