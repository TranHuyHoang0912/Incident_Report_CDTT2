import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

require('dotenv').config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uploadDir = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
