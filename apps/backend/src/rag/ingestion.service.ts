import { Injectable, Inject } from '@nestjs/common';
import { schema } from '@anode/supabase';
import { eq, desc } from 'drizzle-orm';
import type { DbClient } from '@anode/supabase';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class IngestionService {
  private hfToken: string;

  constructor(
    @Inject('DRIZZLE_DATABASE_CONNECTION') private readonly database: DbClient,
    private readonly configService: ConfigService,
  ) {
    this.hfToken = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  // Resolve a Clerk org ID (e.g. "org_xxx") to the internal tenants.id (uuid)
  private async resolveTenant(clerkTenantId: string) {
    const tenant = await this.database.query.tenants.findFirst({
      where: eq(schema.tenants.tenantId, clerkTenantId),
    });

    if (!tenant) {
      throw new Error(`No tenant found for tenantId: ${clerkTenantId}`);
    }

    return tenant;
  }

  async createSource(clerkTenantId: string, name: string, type: 'file' | 'url', location?: string) {
    const tenant = await this.resolveTenant(clerkTenantId);
    const newSourceId = randomUUID();

    await this.database.insert(schema.knowledgeSources).values({
      id: newSourceId,
      tenantId: tenant.id,
      name: name,
      type: type,
      ...(location && { location }),
    });

    return {
      success: true,
      message: 'Knowledge source registered successfully.',
      sourceId: newSourceId,
    };
  }

  private chunkText(text: string, chunkSize = 1000, chunkOverlap = 200): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      chunks.push(text.substring(startIndex, endIndex).trim());
      startIndex += chunkSize - chunkOverlap;
    }
    return chunks;
  }

  async getTenantSources(clerkTenantId: string) {
    try {
      const tenant = await this.resolveTenant(clerkTenantId);

      const results = await this.database
        .select({
          id: schema.knowledgeSources.id,
          name: schema.knowledgeSources.name,
          type: schema.knowledgeSources.type,
          createdAt: schema.knowledgeSources.createdAt,
        })
        .from(schema.knowledgeSources)
        .where(eq(schema.knowledgeSources.tenantId, tenant.id))
        .orderBy(desc(schema.knowledgeSources.createdAt));

      return results;
    } catch (error) {
      console.error('Failed to retrieve knowledge sources for tenant:', error);
      throw new Error(`Database context lookup failed: ${(error as any).message}`);
    }
  }

  async processIngestion(clerkTenantId: string, sourceId: string, rawContent: string) {
    const tenant = await this.resolveTenant(clerkTenantId);

    const textSegments = this.chunkText(rawContent);
    if (textSegments.length === 0) return { success: true, chunksProcessed: 0 };

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction",
      {
        headers: {
          Authorization: `Bearer ${this.hfToken}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        method: "POST",
        body: JSON.stringify({ inputs: textSegments }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API failed: ${errorText}`);
    }

    const embeddings: number[][] = await response.json();

    const insertRecords = textSegments.map((segment, index) => {
      const rawVector = embeddings[index];
      let vector = Array.isArray(rawVector) ? (rawVector as any).flat() : rawVector;

      if (!vector || vector.length === 0) {
        throw new Error(`Failed to map vector embedding index ${index}`);
      }

      if (vector.length === 768) {
        const padding = new Array(768).fill(0);
        vector = [...vector, ...padding];
      }

      const vectorStringFormat = `[${vector.join(',')}]`;

      return {
        tenantId: tenant.id,
        sourceId,
        content: segment,
        embedding: vectorStringFormat as any,
        minRole: 'user',
        metadata: { index, charLength: segment.length },
      };
    });

    await this.database.insert(schema.chunks).values(insertRecords);

    return {
      success: true,
      chunksProcessed: insertRecords.length,
    };
  }
}