import { ProductGrid } from "@/components/products/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductWithCategory } from "@/types/product";
import { ArrowRight, RefreshCw, Shield, Sparkles, Truck } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";

const getFeaturedProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(name, slug)")
      .eq("is_active", true)
      .eq("featured", true)
      .limit(8);
    return data;
  },
  ["featured-products"],
  { revalidate: 300 }
);

const getNewProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    return data;
  },
  ["new-products"],
  { revalidate: 300 }
);

export default async function HomePage() {
  const [featuredProducts, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-background to-primary/5">
        <div className="container mx-auto grid items-center gap-8 px-4 py-20 md:grid-cols-2 md:py-32">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3 stroke-yellow-600" />
              New Collection Available
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Discover Your{" "}
              <span className="text-primary">Perfect Sparkle</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Explore our exquisite collection of fashion jewellery. From elegant
              necklaces to stunning rings, find pieces that express your unique
              style.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href={ROUTES.products}>
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`${ROUTES.products}?category=jewellery-sets`}>
                  View Collections
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=4000&q=100"
              alt="Fashion jewellery collection"
              width={500}
              height={500}
              priority
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our curated collection of fashion jewellery
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`${ROUTES.products}?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-medium">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Featured Products
              </h2>
              <p className="mt-1 text-muted-foreground">
                Our most popular picks for you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={ROUTES.products}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProductGrid
            products={featuredProducts as unknown as ProductWithCategory[]}
          />
        </section>
      )}

      {/* New Arrivals */}
      {newProducts && newProducts.length > 0 && (
        <section className="bg-muted/50">
          <div className="container mx-auto px-4 py-16">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  New Arrivals
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Just landed - fresh new styles
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`${ROUTES.products}?sort=newest`}>
                  Shop New
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ProductGrid
              products={newProducts as unknown as ProductWithCategory[]}
            />
          </div>
        </section>
      )}

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Truck,
              title: "Free Shipping",
              description: "On orders above ₹999",
            },
            {
              icon: Shield,
              title: "Secure Payment",
              description: "100% secure checkout",
            },
            {
              icon: RefreshCw,
              title: "Easy Returns",
              description: "7-day return policy",
            },
            {
              icon: Sparkles,
              title: "Quality Assured",
              description: "Premium fashion jewellery",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
