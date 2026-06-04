import { Module } from '@nestjs/common';
import { FaceRecognitionModule } from './face-recognition/face-recognition.module';

@Module({
  imports: [FaceRecognitionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
