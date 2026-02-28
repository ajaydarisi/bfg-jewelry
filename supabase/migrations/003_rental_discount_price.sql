ALTER TABLE public.products
  ADD COLUMN rental_discount_price numeric(10,2) CHECK (rental_discount_price >= 0);
