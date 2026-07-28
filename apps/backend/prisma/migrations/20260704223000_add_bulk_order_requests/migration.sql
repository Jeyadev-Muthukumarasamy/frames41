CREATE TABLE "bulk_order_requests" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "quantity" INTEGER NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_order_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bulk_order_requests_email_idx" ON "bulk_order_requests"("email");
CREATE INDEX "bulk_order_requests_created_at_idx" ON "bulk_order_requests"("created_at");
