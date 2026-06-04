import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Kích hoạt CORS để cho phép Next.js (port 3001 hoặc 3000) gọi API
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Tăng giới hạn tải trọng Payload JSON lên 10mb để chứa được chuỗi ảnh Base64 chất lượng cao
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const port = 3000;
  await app.listen(port);
  console.log(`[GATEWAY LAUNCHED] NestJS Gateway đang chạy tại: http://localhost:${port}`);
}
bootstrap();
