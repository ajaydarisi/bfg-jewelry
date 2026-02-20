export function getCategoryName(
  category: { name: string; name_telugu?: string | null },
  locale: string
): string {
  if (locale === "te" && category.name_telugu) return category.name_telugu;
  return category.name;
}

export function getProductName(
  product: { name: string; name_telugu?: string | null },
  locale: string
): string {
  if (locale === "te" && product.name_telugu) return product.name_telugu;
  return product.name;
}

export function getProductDescription(
  product: { description: string | null; description_telugu?: string | null },
  locale: string
): string | null {
  if (locale === "te" && product.description_telugu) return product.description_telugu;
  return product.description;
}
