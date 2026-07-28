CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "products_is_active_created_at_idx"
  ON "products" ("is_active", "created_at");
CREATE INDEX IF NOT EXISTS "products_is_active_base_price_idx"
  ON "products" ("is_active", "base_price");
CREATE INDEX IF NOT EXISTS "products_is_active_is_featured_created_at_idx"
  ON "products" ("is_active", "is_featured", "created_at");
CREATE INDEX IF NOT EXISTS "products_is_active_is_best_seller_created_at_idx"
  ON "products" ("is_active", "is_best_seller", "created_at");

CREATE INDEX IF NOT EXISTS "products_name_trgm_idx"
  ON "products" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_short_description_trgm_idx"
  ON "products" USING GIN ("short_description" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_description_trgm_idx"
  ON "products" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "orders_user_placed_at_idx"
  ON "orders" ("user_id", "placed_at" DESC);
CREATE INDEX IF NOT EXISTS "reviews_product_approved_created_at_idx"
  ON "reviews" ("product_id", "is_approved", "created_at" DESC);
