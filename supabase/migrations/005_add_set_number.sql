-- Add set_number column to products table for rental set identification
ALTER TABLE public.products
  ADD COLUMN set_number integer CHECK (set_number > 0);
