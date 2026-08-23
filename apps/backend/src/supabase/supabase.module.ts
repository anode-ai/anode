import { Module, Global } from '@nestjs/common';
import { db } from '@anode/supabase';

@Global() // 👈 Add this decorator to make it available everywhere instantly!
@Module({
  providers: [
    {
      provide: 'DRIZZLE_DATABASE_CONNECTION',
      useFactory: () => {
        // @anode/supabase returns null when DATABASE_URL was missing at import time.
        if (!db) {
          throw new Error(
            'DATABASE_URL is not set, so the Drizzle client could not be created. ' +
              'Copy .env.example to .env at the monorepo root and set DATABASE_URL.',
          );
        }
        return db;
      },
    },
  ],
  exports: ['DRIZZLE_DATABASE_CONNECTION'], // 👈 Make sure this is exported!
})
export class SupabaseModule {}