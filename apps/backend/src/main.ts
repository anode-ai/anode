// 👇 THIS MUST BE LINE 1 - BEFORE ANY OTHER IMPORTS
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Anode AI API Docs')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
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