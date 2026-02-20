-- Add Telugu description field to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_telugu text;
