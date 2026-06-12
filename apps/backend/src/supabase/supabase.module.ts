import { Module, Global } from '@nestjs/common';
import { getDb } from '@anode/supabase';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_DATABASE_CONNECTION',
      useFactory: () => getDb(),
    },
  ],
  exports: ['DRIZZLE_DATABASE_CONNECTION'],
})
export class SupabaseModule {}