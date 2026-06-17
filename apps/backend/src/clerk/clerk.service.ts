import { Injectable, Inject } from '@nestjs/common';
import { schema } from '@anode/supabase';
import type { DbClient } from '@anode/supabase';

@Injectable()
export class ClerkService {

  constructor(
    @Inject('DRIZZLE_DATABASE_CONNECTION')
    private readonly database: DbClient,
  ) {}

  async handleEvent(event: any) {

    if (event.type === 'organization.created') {
      const org = event.data;

      const slug =
        org.slug ??
        org.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      await this.database
        .insert(schema.tenants)
        .values({
          tenantId: org.id,   // Clerk org id
          name: org.name,
          slug,
        });

      return {
        success: true,
        message: 'Tenant created',
      };
    }

    return {
      received: true,
    };
  }
}