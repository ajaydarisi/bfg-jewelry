"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";
import type { Category } from "@/types/product";

interface MobileFilterSheetProps {
  categories?: Category[];
}

export function MobileFilterSheet({ categories }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("products.filters");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {t("title")}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ProductFilters categories={categories} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
