import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';
import { IngestionService } from './rag/ingestion.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './auth/auth.guard';
import * as path from 'path';
import { ClerkController } from './clerk/clerk.controller';
import { ClerkService } from './clerk/clerk.service';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    // 1. 🔥 MUST BE FIRST: Load env variables into global memory space immediately
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '../../../.env'),
    }),
    CrawlerModule,
    
    // 2. NOW SAFE: Reads the initialized env variables cleanly without racing
    SupabaseModule,
  ],
  controllers: [
    AppController,
    RagController,
    ClerkController,
  ],
  providers: [
    AppService, 
    RagService, 
    IngestionService,
    ClerkService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}