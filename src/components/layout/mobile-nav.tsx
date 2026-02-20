"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Search, Heart, ShoppingBag, Sun, Moon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, CATEGORIES, ROUTES } from "@/lib/constants";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchOpen: () => void;
  itemCount: number;
}

export function MobileNav({ open, onOpenChange, onSearchOpen, itemCount }: MobileNavProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 pl-3">
        <SheetHeader>
          <SheetTitle className="text-left font-heading tracking-wide text-primary">
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <h3 className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`${ROUTES.products}?category=${cat.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <Link
              href={ROUTES.products}
              onClick={() => onOpenChange(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              All Products
            </Link>
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-left"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
              Search
            </button>
            <Link
              href={ROUTES.wishlist}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Heart className="h-4 w-4" strokeWidth={1.5} />
              Wishlist
            </Link>
            <Link
              href={ROUTES.cart}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              Shopping Bag
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
            <Link
              href={ROUTES.account}
              onClick={() => onOpenChange(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              My Account
            </Link>
          </div>

          <Separator />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-left"
          >
            <Sun className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
            <Moon className="hidden h-4 w-4 dark:block" strokeWidth={1.5} />
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
