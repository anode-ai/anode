import { 
  Controller, 
  Post, 
  Get, // 🎯 Added for pulling knowledge source records
  Body, 
  Headers, 
  BadRequestException, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { IngestionService } from './ingestion.service';
import 'multer';

// Contract payloads mapped explicitly to allow optional source filtering
interface SearchQueryDto {
  query: string;    
  limit?: number;
  sourceId?: string; // Target a single file scope when provided
}

interface CreateSourceDto {
  name: string;
  type: 'file' | 'url';
  location?: string;
}

@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly ingestionService: IngestionService 
  ) {}

  @Get('sources')
  async findAllSources(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Missing structural context header x-tenant-id.');
    }

    // Returns array of dynamic knowledge sources scoped to this specific tenant
    return this.ingestionService.getTenantSources(tenantId);
  }

  @Post('search')
  async search(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: SearchQueryDto 
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing structural context header x-tenant-id.');
    }
    if (!body.query) {
      throw new BadRequestException('Property "query" text string must be provided in body.');
    }

    // 1. Hit Supabase to pull back vector chunks (passing the optional sourceId filter)
    const matchingChunks = await this.ragService.searchVectorChunks(
      tenantId, 
      body.query, 
      'user', 
      body.limit || 3,
      body.sourceId 
    );

    // 2. Fetch the true source name dynamically to update the system instructions
    let dynamicSourceName = 'Uploaded Knowledge Base';
    if (matchingChunks.length > 0) {
      dynamicSourceName = await this.ragService.getSourceName(matchingChunks[0].sourceId);
    }

    // 3. Send chunks and query to Llama-3 to compile the synthesized answer
    const refinedAnswer = await this.ragService.refineAnswer(
      body.query, 
      matchingChunks,
      dynamicSourceName
    );

    // 4. Return both the refined answer AND matching trace fragments back to React playground
    return {
      answer: refinedAnswer,
      references: matchingChunks.map(chunk => ({
        id: chunk.id,
        similarityScore: chunk.similarity,
        snippet: chunk.content.substring(0, 120) + '...' 
      }))
    };
  }

  @Post('ingest')
  async ingest(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { sourceId: string; content: string }
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing structural context header x-tenant-id.');
    }
    if (!body.sourceId || !body.content) {
      throw new BadRequestException('Missing structural params sourceId or content payload body.');
    }

    return this.ingestionService.processIngestion(
      tenantId,
      body.sourceId,
      body.content
    );
  }

  @Post('source')
  async createKnowledgeSource(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: CreateSourceDto
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing structural context header x-tenant-id.');
    }
    if (!body.name || !body.type) {
      throw new BadRequestException('Missing required body fields: name or type.');
    }

    return this.ingestionService.createSource(
      tenantId, 
      body.name, 
      body.type, 
      body.location
    );
  }

  @Post('ingest-file')
  @UseInterceptors(FileInterceptor('file')) // 'file' matches the key name inside our React FormData structure
  async ingestFile(
    @Headers('x-tenant-id') tenantId: string,
    @Body('sourceId') sourceId: string, // Form-data string fields are read directly from @Body
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing structural context header x-tenant-id.');
    }
    if (!sourceId) {
      throw new BadRequestException('Missing structural param sourceId in form body.');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach a text file.');
    }

    // Guardrail to make sure they aren't uploading PDFs/Images yet
    if (file.mimetype !== 'text/plain') {
      throw new BadRequestException('Only plain text (.txt) files are supported right now.');
    }

    // Convert the binary file buffer directly into a clean string layout
    const fileContent = file.buffer.toString('utf-8');

    // Reuse your working pipeline directly!
    return this.ingestionService.processIngestion(
      tenantId,
      sourceId,
      fileContent
    );
  }
}