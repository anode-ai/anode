// 👇 THIS MUST BE LINE 1 - BEFORE ANY OTHER IMPORTS
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js default dev port
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-id', // Make sure our tenant header is explicitly allowed!
  });
  const port = process.env.PORT ?? 3002
  await app.listen(port);
  console.log("Listening on port : ",port )
}
bootstrap();