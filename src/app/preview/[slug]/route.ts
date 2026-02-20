import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, images, price, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  const image = product.images?.[0] ?? "";
  const description =
    product.description || `Shop ${product.name} - ₹${product.price}`;
  const productUrl = `${new URL(request.url).origin}/products/${product.slug}`;

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="${escapeHtml(product.name)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(productUrl)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(product.name)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(productUrl)}" />
    <title>${escapeHtml(product.name)}</title>
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(productUrl)}">${escapeHtml(product.name)}</a>...</p>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
