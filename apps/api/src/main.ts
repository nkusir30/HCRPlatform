// ============================================================
// HCR DSP — NestJS Bootstrap
// Loads env, configures global prefixes & CORS, starts app
// ============================================================

import 'reflect-metadata'; // must run before any decorated module loads
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';

import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS ---
  app.enableCors({
    origin: process.env.WEB_URL?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // --- Global pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // --- Cookie parser ---
  app.use(cookieParser());

  // --- Global prefix ---
  app.setGlobalPrefix('api');

  // --- Health check endpoint ---
  app.enableShutdownHooks();

  const port = Number(process.env.PORT || process.env.APP_PORT || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`HCR API running on http://localhost:${port}`);
  console.log(`API docs: http://localhost:${port}/api/docs`);
  console.log(`Swagger: http://localhost:${port}/api/docs-json`);
}
bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
