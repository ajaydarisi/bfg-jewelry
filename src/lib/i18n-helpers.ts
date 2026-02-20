export function getCategoryName(
  category: { name: string; name_telugu?: string | null },
  locale: string
): string {
  if (locale === "te" && category.name_telugu) return category.name_telugu;
  return category.name;
}
