"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search, Heart, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, CATEGORIES, IS_ONLINE, ROUTES } from "@/lib/constants";
import Image from "next/image";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchOpen: () => void;
  itemCount: number;
}

export function MobileNav({ open, onOpenChange, onSearchOpen, itemCount }: MobileNavProps) {
  const t = useTranslations("nav");
  const tc = useTranslations("constants");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 pl-3">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left font-heading tracking-wide text-primary">
            <Image src="/images/logo.svg" alt="" width={20} height={20} />
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {t("categories")}
            </h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`${ROUTES.products}?category=${cat.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {tc(`categories.${cat.slug}`)}
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
              {t("allProducts")}
            </Link>
            <Link
              href={ROUTES.about}
              onClick={() => onOpenChange(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {t("aboutUs")}
            </Link>
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-left"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
              {t("search")}
            </button>
            <Link
              href={ROUTES.wishlist}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Heart className="h-4 w-4" strokeWidth={1.5} />
              {t("wishlist")}
            </Link>
            {IS_ONLINE && (
              <Link
                href={ROUTES.cart}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                {t("shoppingBag")}
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Link>
            )}
          </div>


        </div>
      </SheetContent>
    </Sheet>
  );
}
