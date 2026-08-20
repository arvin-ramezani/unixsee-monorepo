-- AlterTable
ALTER TABLE "website_discoveries" ADD COLUMN     "stack_checked_at" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "website_traffic_snapshots" (
    "discovery_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "active_visitor_count" INTEGER,
    "active_window_seconds" INTEGER,
    "active_window_started_at" TIMESTAMPTZ(6),
    "active_measured_at" TIMESTAMPTZ(6),
    "active_status" JSONB,
    "visitors_24h_count" INTEGER,
    "visitors_24h_window_seconds" INTEGER,
    "visitors_24h_coverage_seconds" INTEGER,
    "visitors_24h_measured_at" TIMESTAMPTZ(6),
    "visitors_24h_algorithm" TEXT,
    "visitors_24h_status" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "website_traffic_snapshots_pkey" PRIMARY KEY ("discovery_id")
);

-- CreateIndex
CREATE INDEX "website_traffic_snapshots_domain_idx" ON "website_traffic_snapshots"("domain");

-- CreateIndex
CREATE INDEX "website_traffic_snapshots_active_measured_at_idx" ON "website_traffic_snapshots"("active_measured_at");

-- CreateIndex
CREATE INDEX "website_traffic_snapshots_visitors_24h_measured_at_idx" ON "website_traffic_snapshots"("visitors_24h_measured_at");

-- AddForeignKey
ALTER TABLE "website_traffic_snapshots" ADD CONSTRAINT "website_traffic_snapshots_discovery_id_fkey" FOREIGN KEY ("discovery_id") REFERENCES "website_discoveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
