// Must stay above the AppModule import: @anode/supabase reads DATABASE_URL when it is
// first required, so the env has to be loaded before that module graph is pulled in.
// The .env lives at the monorepo root, same as drizzle.config.ts expects.
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('🚀 SYSTEM DIAGNOSTIC: ROOT ENV CHECK -> KEY LOADED:', !!process.env.OPENAI_API_KEY);
  const port = process.env.PORT ?? 3002
  await app.listen(port);
  console.log("Listening on port : ",port )
}
bootstrap();