import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FaceRecognitionService } from './face-recognition.service';

// Định nghĩa DTO cho Đăng ký khuôn mặt
class RegisterFaceDto {
  name: string;
  image: string; // Base64 string
}

// Định nghĩa DTO cho Dự đoán khuôn mặt
class PredictFaceDto {
  image: string; // Base64 string
}

/**
 * Controller chịu trách nhiệm định tuyến các yêu cầu liên quan đến Nhận diện Khuôn mặt
 */
@Controller('api/v1/faces')
export class FaceRecognitionController {
  constructor(private readonly faceService: FaceRecognitionService) {}

  /**
   * Chức năng 1: Đăng ký khuôn mặt mới
   * Định tuyến POST /api/v1/faces/register
   */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterFaceDto) {
    return this.faceService.registerFace(body.name, body.image);
  }

  /**
   * Chức năng 2: Điểm danh tự động / Nhận diện khuôn mặt real-time
   * Định tuyến POST /api/v1/faces/predict
   */
  @Post('predict')
  @HttpCode(HttpStatus.OK)
  async predict(@Body() body: PredictFaceDto) {
    return this.faceService.predictFace(body.image);
  }
}
