import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "New Product" };
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = createAdminClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">New Product</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
