"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MATERIALS, PRODUCT_TYPES } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";
import { getCategoryName } from "@/lib/i18n-helpers";
import { useFilterLoading } from "./filter-loading-context";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Category } from "@/types/product";

export interface PendingFilters {
  category: string;
  material: string;
  type: string;
  priceRange: number[];
}

interface ProductFiltersProps {
  categories?: Category[];
  mode?: "immediate" | "deferred";
  onFiltersChange?: (filters: PendingFilters) => void;
}

function buildCategoryTree(categories: Category[]) {
  const parents = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);
  return parents.map((parent) => ({
    ...parent,
    children: categories
      .filter((c) => c.parent_id === parent.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export function ProductFilters({ categories = [], mode = "immediate", onFiltersChange }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("products.filters");
  const tc = useTranslations("constants");
  const { setLoading } = useFilterLoading();
  const isDeferred = mode === "deferred";

  const urlCategory = searchParams.get("category") || "";
  const urlMaterial = searchParams.get("material") || "";
  const urlType = searchParams.get("type") || "";
  const urlMinPrice = Number(searchParams.get("minPrice")) || 0;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || 10000;

  // In deferred mode, all selections are local state
  const [pendingCategory, setPendingCategory] = useState(urlCategory);
  const [pendingMaterial, setPendingMaterial] = useState(urlMaterial);
  const [pendingType, setPendingType] = useState(urlType);
  const [priceRange, setPriceRange] = useState([urlMinPrice, urlMaxPrice]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => {
    const cat = urlCategory;
    const set = new Set<string>();
    if (cat) {
      const found = categories.find((c) => c.slug === cat);
      if (found?.parent_id) {
        set.add(found.parent_id);
      } else if (found) {
        set.add(found.id);
      }
    }
    return set;
  });

  // Effective values: deferred reads local state, immediate reads URL
  const currentCategory = isDeferred ? pendingCategory : urlCategory;
  const currentMaterial = isDeferred ? pendingMaterial : urlMaterial;
  const currentType = isDeferred ? pendingType : urlType;

  const categoryTree = buildCategoryTree(categories);
  const groupedParents = categoryTree.filter((p) => p.children.length > 0);
  const standaloneParents = categoryTree.filter((p) => p.children.length === 0);

  // Notify parent of filter changes in deferred mode
  function notifyChange(overrides: Partial<PendingFilters>) {
    if (isDeferred && onFiltersChange) {
      onFiltersChange({
        category: pendingCategory,
        material: pendingMaterial,
        type: pendingType,
        priceRange,
        ...overrides,
      });
    }
  }

  function updateFilter(key: string, value: string) {
    if (isDeferred) {
      if (key === "category") {
        setPendingCategory(value);
        notifyChange({ category: value });
      } else if (key === "material") {
        setPendingMaterial(value);
        notifyChange({ material: value });
      } else if (key === "type") {
        setPendingType(value);
        notifyChange({ type: value });
      }
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    setLoading(true);
    router.push(`?${params.toString()}`);
  }

  function applyPriceFilter() {
    if (isDeferred) {
      notifyChange({ priceRange });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }
    if (priceRange[1] < 10000) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    setLoading(true);
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    if (isDeferred) {
      setPendingCategory("");
      setPendingMaterial("");
      setPendingType("");
      setPriceRange([0, 10000]);
      notifyChange({ category: "", material: "", type: "", priceRange: [0, 10000] });
      return;
    }
    setLoading(true);
    router.push("/products");
  }

  function toggleParent(parentId: string) {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  }

  const hasFilters = currentCategory || currentMaterial || currentType || (isDeferred ? priceRange[0] > 0 || priceRange[1] < 10000 : urlMinPrice > 0 || urlMaxPrice < 10000);

  return (
    <div className="space-y-6">
      {!isDeferred && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("title")}</h2>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-0 text-xs text-muted-foreground"
              >
                <X className="mr-1 h-3 w-3" />
                {t("clearAll")}
              </Button>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Type: Sale / Rental */}
      <div>
        <h3 className="mb-3 text-sm font-medium">{t("type")}</h3>
        <RadioGroup
          value={currentType || "all"}
          onValueChange={(value) =>
            updateFilter("type", value === "all" ? "" : value)
          }
        >
          {PRODUCT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <RadioGroupItem value={type.value} id={`type-${type.value}`} />
              <Label
                htmlFor={`type-${type.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {tc(`productTypes.${type.value}`)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Category — Hierarchical */}
      <div>
        <h3 className="mb-3 text-sm font-medium">{t("category")}</h3>
        <div className="space-y-1">
          {groupedParents.map((parent) => (
            <div key={parent.slug}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleParent(parent.id)}
                  className="shrink-0 p-0.5"
                >
                  <ChevronDown
                    className={`size-3 text-muted-foreground transition-transform ${
                      expandedParents.has(parent.id) ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                <Checkbox
                  id={`cat-${parent.slug}`}
                  checked={currentCategory === parent.slug}
                  onCheckedChange={(checked) =>
                    updateFilter("category", checked ? parent.slug : "")
                  }
                />
                <Label
                  htmlFor={`cat-${parent.slug}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getCategoryName(parent, locale)}
                </Label>
              </div>
              {expandedParents.has(parent.id) &&
                parent.children.map((child) => (
                  <div
                    key={child.slug}
                    className="flex items-center gap-2 pl-8 mt-1"
                  >
                    <Checkbox
                      id={`cat-${child.slug}`}
                      checked={currentCategory === child.slug}
                      onCheckedChange={(checked) =>
                        updateFilter("category", checked ? child.slug : "")
                      }
                    />
                    <Label
                      htmlFor={`cat-${child.slug}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {getCategoryName(child, locale)}
                    </Label>
                  </div>
                ))}
            </div>
          ))}
          {standaloneParents.length > 0 && groupedParents.length > 0 && (
            <Separator className="my-2" />
          )}
          {standaloneParents.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-2 pl-5">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={currentCategory === cat.slug}
                onCheckedChange={(checked) =>
                  updateFilter("category", checked ? cat.slug : "")
                }
              />
              <Label
                htmlFor={`cat-${cat.slug}`}
                className="text-sm font-normal cursor-pointer"
              >
                {getCategoryName(cat, locale)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-medium">{t("priceRange")}</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        {!isDeferred && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={applyPriceFilter}
          >
            {t("applyPrice")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Material */}
      <div>
        <h3 className="mb-3 text-sm font-medium">{t("material")}</h3>
        <div className="space-y-2">
          {MATERIALS.map((material) => (
            <div key={material} className="flex items-center gap-2">
              <Checkbox
                id={`mat-${material}`}
                checked={currentMaterial === material}
                onCheckedChange={(checked) =>
                  updateFilter("material", checked ? material : "")
                }
              />
              <Label
                htmlFor={`mat-${material}`}
                className="text-sm font-normal"
              >
                {tc(`materials.${material}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
