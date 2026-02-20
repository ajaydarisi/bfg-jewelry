"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_NAME, CATEGORIES, ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function Footer() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  }
  return (
    <footer className="border-t">
      {/* Newsletter / Community section */}
      <div className="container mx-auto px-4 py-16 text-center border-b">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Stay in Touch
        </p>
        <h3 className="text-2xl md:text-3xl mb-3">
          Join the BFG Jewellery World
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Be the first to know about new collections, exclusive offers,
          and styling inspiration.
        </p>
      </div>

      {/* Links grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-heading text-lg tracking-wide text-primary"
            >
              {APP_NAME}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Contemporary fashion jewellery designed to celebrate your
              unique style, every day.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`${ROUTES.products}?category=${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={ROUTES.accountOrders}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.cart}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.wishlist}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">
              My Account
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={ROUTES.account}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.accountAddresses}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Addresses
                </Link>
              </li>
              <li>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href={ROUTES.login}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground tracking-wide">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
