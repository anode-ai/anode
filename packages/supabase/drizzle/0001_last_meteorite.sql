ALTER TABLE "chunks" ADD COLUMN "metadata" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "tenant_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_tenant_id_unique" UNIQUE("tenant_id");